import { NextResponse } from 'next/server';

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
    // The Judge.me API has a bug where passing large numerical product_ids throws 'too big' error.
    // Instead, we fetch all reviews and filter using the reliable 'product_external_id' payload prop
    const reviewsRes = await fetch(
      `https://judge.me/api/v1/reviews?shop_domain=${domain}&api_token=${token}&per_page=100` // Fetch up to 100 latest reviews
    );

    if (!reviewsRes.ok) {
      return NextResponse.json({ reviews: [], averageRating: 0, total: 0 });
    }

    const reviewsData = await reviewsRes.json();
    const reviews = reviewsData.reviews || [];

    // Filter to only approved/published reviews matching this specific product
    const publishedReviews = reviews.filter(
      (r: any) => !r.hidden && String(r.product_external_id) === String(externalId)
    );

    // Calculate average
    const total = publishedReviews.length;
    let averageRating = 0;
    if (total > 0) {
      const sum = publishedReviews.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0);
      averageRating = sum / total;
    }

    return NextResponse.json({
      reviews: publishedReviews,
      total,
      averageRating
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
