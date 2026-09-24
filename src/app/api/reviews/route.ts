import { NextResponse } from 'next/server';
import dns from "dns";

// Force IPv4 resolution first to avoid Node IPv6 connection failures
dns.setDefaultResultOrder("ipv4first");

// Reviews change rarely; cache Judge.me responses so repeat page views don't
// hit Judge.me (or burn Vercel CPU) every time.
const REVIEWS_REVALIDATE_SECONDS = 600; // 10 min
const PRODUCT_ID_REVALIDATE_SECONDS = 86400; // Shopify->Judge.me id mapping never changes

const CACHE_HEADERS = {
  'Cache-Control': `public, s-maxage=${REVIEWS_REVALIDATE_SECONDS}, stale-while-revalidate=${REVIEWS_REVALIDATE_SECONDS * 3}`,
};

function cachedJson(body: unknown) {
  return NextResponse.json(body, { headers: CACHE_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const externalId = searchParams.get('productId'); // Shopify product ID

  if (!externalId) {
    return NextResponse.json({ error: 'Missing productId parameter' }, { status: 400 });
  }

  const domain = process.env.JUDGE_ME_SHOP_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.JUDGE_ME_PRIVATE_TOKEN;

  if (!domain || !token) {
    console.error("Missing Judge.me credentials in environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // 1. Resolve Shopify external ID to Judge.me internal product ID
    let internalId = null;
    try {
      const productRes = await fetch(
        `https://judge.me/api/v1/products/-1?shop_domain=${domain}&api_token=${token}&external_id=${externalId}`,
        { next: { revalidate: PRODUCT_ID_REVALIDATE_SECONDS } }
      );
      if (productRes.ok) {
        const productData = await productRes.json();
        internalId = productData.product?.id || productData.id;
      }
    } catch (e) {
      console.warn("Failed to resolve Judge.me internal product ID:", e);
    }

    // 2. Fetch reviews specifically for this product using the internal ID if found
    if (internalId) {
      const reviewsRes = await fetch(
        `https://judge.me/api/v1/reviews?shop_domain=${domain}&api_token=${token}&product_id=${internalId}&per_page=100`,
        { next: { revalidate: REVIEWS_REVALIDATE_SECONDS } }
      );

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        const reviews = data.reviews || [];
        const publishedReviews = reviews.filter((r: any) => !r.hidden);
        return cachedJson(calculateStats(publishedReviews));
      }
    }

    // 3. Fallback: Fetch all reviews and filter (if no internal ID was resolved or query failed)
    const fallbackRes = await fetch(
      `https://judge.me/api/v1/reviews?shop_domain=${domain}&api_token=${token}&per_page=100`,
      { next: { revalidate: REVIEWS_REVALIDATE_SECONDS } }
    );
    if (!fallbackRes.ok) {
      return NextResponse.json({ reviews: [], averageRating: 0, total: 0 });
    }
    const allData = await fallbackRes.json();
    const filtered = (allData.reviews || []).filter(
      (r: any) => !r.hidden && String(r.product_external_id) === String(externalId)
    );
    return cachedJson(calculateStats(filtered));

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function calculateStats(reviews: any[]) {
  const total = reviews.length;
  let averageRating = 0;
  if (total > 0) {
    const sum = reviews.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0);
    averageRating = sum / total;
  }
  return {
    reviews,
    total,
    averageRating
  };
}
