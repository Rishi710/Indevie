/**
 * Server-side Judge.me access. Used only by the /api/reviews routes.
 *
 * Design (keeps Vercel usage and Judge.me calls small and independent of how
 * many products or visitors we have):
 *
 *  - ONE shared copy of the shop's published reviews lives in Next's data cache,
 *    tagged `judgeme-reviews`. Every route reads from it, so Judge.me is called
 *    a handful of times per hour at most, not once per product per visitor.
 *  - It's refreshed (a) immediately when Judge.me calls our webhook
 *    (/api/webhooks/judgeme) after a review is created/changed, and (b) by a
 *    safety-net expiry every 30 minutes in case a webhook is ever missed.
 *  - Only the fields the storefront needs are returned. Judge.me's raw records
 *    include reviewers' email, phone and IP, which must never reach the browser.
 */

export const JUDGEME_REVIEWS_TAG = "judgeme-reviews";

/** Safety-net expiry for the shared copy; webhooks refresh it sooner. */
const DATA_CACHE_SECONDS = 30 * 60;
const PER_PAGE = 100;
const MAX_PAGES = 20; // 2,000 reviews; raise (or move to per-product queries) beyond that

/**
 * Vercel's CDN keeps each API response for a few minutes so repeat page views
 * don't run a function at all. `max-age=0` stops browsers keeping their own copy.
 */
export const REVIEWS_CDN_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=60";

/** The only review fields that are safe to send to visitors. */
export interface PublicReview {
  id: number;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  reviewer: { name: string };
}

export interface PublicReviewEntry {
  /** Shopify product ID (numeric) the review belongs to. */
  productId: string;
  review: PublicReview;
}

export interface RatingSummary {
  averageRating: number;
  total: number;
}

/** A review a shopper could actually see on Judge.me: approved, published, not hidden. */
function isPublicReview(r: any): boolean {
  return !r.hidden && r.published !== false && r.curated === "ok";
}

function toPublicEntry(r: any): PublicReviewEntry {
  return {
    productId: String(r.product_external_id),
    review: {
      id: r.id,
      title: r.title ?? null,
      body: r.body ?? "",
      rating: Number(r.rating) || 0,
      created_at: r.created_at,
      reviewer: { name: r.reviewer?.name ?? "" },
    },
  };
}

/** All published reviews for the shop, from the shared cached copy. Throws if Judge.me is unreachable. */
export async function getPublicReviews(): Promise<PublicReviewEntry[]> {
  const domain = process.env.JUDGE_ME_SHOP_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.JUDGE_ME_PRIVATE_TOKEN;
  if (!domain || !token) {
    throw new Error("Missing Judge.me credentials in environment variables.");
  }

  const entries: PublicReviewEntry[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(
      `https://judge.me/api/v1/reviews?shop_domain=${domain}&api_token=${token}&per_page=${PER_PAGE}&page=${page}`,
      { next: { revalidate: DATA_CACHE_SECONDS, tags: [JUDGEME_REVIEWS_TAG] } }
    );
    if (!res.ok) throw new Error(`Judge.me responded ${res.status}`);

    const data = await res.json();
    const reviews: any[] = data.reviews || [];
    for (const r of reviews) {
      if (isPublicReview(r)) entries.push(toPublicEntry(r));
    }
    if (reviews.length < PER_PAGE) break;
  }
  return entries;
}

export function statsFor(reviews: PublicReview[]): RatingSummary {
  const total = reviews.length;
  if (total === 0) return { averageRating: 0, total: 0 };
  return {
    averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / total,
    total,
  };
}

/** Rating summary per Shopify product ID, for every product that has reviews. */
export function summarizeByProduct(entries: PublicReviewEntry[]): Record<string, RatingSummary> {
  const grouped = new Map<string, PublicReview[]>();
  for (const { productId, review } of entries) {
    const list = grouped.get(productId);
    if (list) list.push(review);
    else grouped.set(productId, [review]);
  }
  const summary: Record<string, RatingSummary> = {};
  for (const [productId, reviews] of grouped) summary[productId] = statsFor(reviews);
  return summary;
}
