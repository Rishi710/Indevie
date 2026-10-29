import { NextResponse } from "next/server";
import dns from "dns";
import { getPublicReviews, statsFor, REVIEWS_CDN_CACHE_CONTROL } from "@/lib/judgeme";

// Force IPv4 resolution first to avoid Node IPv6 connection failures
dns.setDefaultResultOrder("ipv4first");

/**
 * Published reviews for ONE product (used by the product page's review list).
 * Reads the shared cached copy in src/lib/judgeme.ts — it never calls Judge.me
 * itself per request — and returns only public fields (no emails/phones).
 */
export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId"); // Shopify product ID

  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json({ error: "Missing or invalid productId parameter" }, { status: 400 });
  }

  try {
    const entries = await getPublicReviews();
    const reviews = entries
      .filter((e) => e.productId === productId)
      .map((e) => e.review)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    return NextResponse.json(
      { reviews, ...statsFor(reviews), total: reviews.length },
      { headers: { "Cache-Control": REVIEWS_CDN_CACHE_CONTROL } }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Not cached, and never reported as "0 reviews" when we just couldn't reach Judge.me.
    return NextResponse.json({ error: "Reviews unavailable" }, { status: 502 });
  }
}
