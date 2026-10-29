// Shared client-side access to the reviews API.
//
// Star ratings: every product card, rating badge and testimonial card on a page
// reads ONE shared request (/api/reviews/summary) instead of each asking for its
// own product, so a page with 30 products makes 1 request, not 30.
// Review lists: the product page's review list fetches just its own product.
//
// Concurrent callers share one in-flight request, and results are reused for a
// few minutes within the page session. Failures aren't cached.

export interface ReviewsResponse {
  reviews?: any[];
  averageRating?: number;
  total?: number;
}

export interface Rating {
  averageRating: number;
  total: number;
}

const TTL_MS = 5 * 60 * 1000;

// ── Ratings for all products (one request) ───────────────────────────────────

let summaryCache: { at: number; promise: Promise<Record<string, Rating>> } | null = null;

function fetchRatingSummary(): Promise<Record<string, Rating>> {
  if (summaryCache && Date.now() - summaryCache.at < TTL_MS) return summaryCache.promise;

  const promise = fetch("/api/reviews/summary")
    .then((res) => {
      if (!res.ok) throw new Error(`Ratings request failed: ${res.status}`);
      return res.json() as Promise<Record<string, Rating>>;
    })
    .catch((err) => {
      summaryCache = null; // don't cache failures
      throw err;
    });

  summaryCache = { at: Date.now(), promise };
  return promise;
}

/** Real rating for one product; `total: 0` means it has no reviews. */
export async function fetchRating(externalId: string): Promise<Rating> {
  const summary = await fetchRatingSummary();
  return summary[externalId] ?? { averageRating: 0, total: 0 };
}

// ── Review list for one product ──────────────────────────────────────────────

const listCache = new Map<string, { at: number; promise: Promise<ReviewsResponse> }>();

export function fetchReviews(externalId: string): Promise<ReviewsResponse> {
  const hit = listCache.get(externalId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;

  const promise = fetch(`/api/reviews?productId=${externalId}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Reviews request failed: ${res.status}`);
      return res.json() as Promise<ReviewsResponse>;
    })
    .catch((err) => {
      listCache.delete(externalId); // don't cache failures
      throw err;
    });

  listCache.set(externalId, { at: Date.now(), promise });
  return promise;
}
