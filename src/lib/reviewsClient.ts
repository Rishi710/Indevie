// Shared client-side fetcher for /api/reviews.
//
// The product page mounts several components for the same product (rating badge
// and review list in both the mobile and desktop layouts, plus product cards),
// and each used to fire its own request. This dedupes them: concurrent callers
// share one in-flight promise, and results are reused for a few minutes.

export interface ReviewsResponse {
  reviews?: any[];
  averageRating?: number;
  total?: number;
}

const TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; promise: Promise<ReviewsResponse> }>();

export function fetchReviews(externalId: string): Promise<ReviewsResponse> {
  const hit = cache.get(externalId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;

  const promise = fetch(`/api/reviews?productId=${externalId}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Reviews request failed: ${res.status}`);
      return res.json() as Promise<ReviewsResponse>;
    })
    .catch((err) => {
      cache.delete(externalId); // don't cache failures
      throw err;
    });

  cache.set(externalId, { at: Date.now(), promise });
  return promise;
}
