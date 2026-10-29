import { NextResponse } from "next/server";
import dns from "dns";
import { getPublicReviews, summarizeByProduct, REVIEWS_CDN_CACHE_CONTROL } from "@/lib/judgeme";

dns.setDefaultResultOrder("ipv4first");

/**
 * Star rating + review count for EVERY product in one response, keyed by
 * Shopify product ID. Product cards, badges and testimonial cards all read this,
 * so a page with 30 products makes one request here instead of 30.
 * Products without reviews are simply absent (the UI shows no rating for them).
 */
export async function GET() {
  try {
    const summary = summarizeByProduct(await getPublicReviews());
    return NextResponse.json(summary, { headers: { "Cache-Control": REVIEWS_CDN_CACHE_CONTROL } });
  } catch (error) {
    console.error("Error fetching review summary:", error);
    return NextResponse.json({ error: "Reviews unavailable" }, { status: 502 });
  }
}
