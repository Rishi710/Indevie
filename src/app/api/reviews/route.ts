import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    console.log(`Fetching reviews for productId: ${externalId} on domain: ${domain}`);

    // Fetch reviews specifically for this product to avoid the 100-global-limit issue.
    // Try using product_id first. If the "large ID bug" is real, we fallback to all-review fetch.
    const reviewsRes = await fetch(
      `https://judge.me/api/v1/reviews?shop_domain=${domain}&api_token=${token}&product_id=${externalId}&per_page=100`
    );

    if (!reviewsRes.ok) {
      console.error(`Judge.me API error: ${reviewsRes.status} ${reviewsRes.statusText}`);
      // Fallback: Fetch all reviews and filter (the original logic)
      const fallbackRes = await fetch(
        `https://judge.me/api/v1/reviews?shop_domain=${domain}&api_token=${token}&per_page=100`
      );
      if (!fallbackRes.ok) {
        return NextResponse.json({ reviews: [], averageRating: 0, total: 0 });
      }
      const allData = await fallbackRes.json();
      const filtered = (allData.reviews || []).filter(
        (r: any) => !r.hidden && String(r.product_external_id) === String(externalId)
      );
      return NextResponse.json(calculateStats(filtered));
    }

    const data = await reviewsRes.json();
    const reviews = data.reviews || [];

    // Filter to ensure we only show approved/published reviews matching this specific product
    // Note: If product_id filter worked, this is redundant but safe.
    const publishedReviews = reviews.filter(
      (r: any) => !r.hidden && (String(r.product_external_id) === String(externalId) || String(r.product_id) === String(externalId))
    );

    return NextResponse.json(calculateStats(publishedReviews));

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
