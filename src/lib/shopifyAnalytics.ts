/**
 * Shopify Analytics for the headless storefront
 * ─────────────────────────────────────────────
 * Shopify only records traffic (sessions, page views, add-to-carts, funnel)
 * for storefronts that send it events — a headless site gets none by default,
 * which is why the Analytics dashboard showed 0 sessions. This sends the same
 * events Shopify's own Hydrogen storefronts send, using Shopify's official
 * `@shopify/hydrogen-react` helpers, so they show up under Analytics →
 * Sessions / Conversion funnel alongside the real order data.
 *
 * Orders themselves are not sent from here: they're created in Shopify by the
 * GoKwik checkout and Shopify already counts them.
 */

import { getClientBrowserParameters, sendShopifyAnalytics } from "@shopify/hydrogen-react/analytics";
import { AnalyticsEventName, AnalyticsPageType } from "@shopify/hydrogen-react/analytics-constants";

const SHOP_ID = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || "gid://shopify/Shop/64973013058";
const CURRENCY = "INR";

const UNIQUE_COOKIE = "_shopify_y"; // visitor identity, ~1 year
const VISIT_COOKIE = "_shopify_s"; // session, 30 min rolling

export { AnalyticsPageType };

export interface TrackedProduct {
  productGid: string;
  variantGid?: string;
  name: string;
  variantName?: string;
  brand: string;
  category?: string;
  price: string;
  sku?: string;
  quantity?: number;
}

// ── Cookies ──────────────────────────────────────────────────────────────────

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

let cookiePromise: Promise<boolean> | null = null;

/**
 * Makes sure the visitor/session cookies exist, asking Shopify to issue them
 * on a first visit. Concurrent callers share one request. Resolves false if
 * Shopify couldn't be reached — callers then skip the event rather than send
 * one with no identity (which Shopify would count as a throwaway session).
 */
function ensureTrackingCookies(): Promise<boolean> {
  const unique = readCookie(UNIQUE_COOKIE);
  const visit = readCookie(VISIT_COOKIE);

  if (unique && visit) {
    writeCookie(VISIT_COOKIE, visit, 30 * 60); // slide the 30-min session window
    return Promise.resolve(true);
  }

  if (!cookiePromise) {
    cookiePromise = fetch("/api/shopify-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uniqueToken: unique, visitToken: visit }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`))))
      .then((tokens: { uniqueToken?: string; visitToken?: string }) => {
        if (!tokens.uniqueToken || !tokens.visitToken) return false;
        writeCookie(UNIQUE_COOKIE, tokens.uniqueToken, 60 * 60 * 24 * 365);
        writeCookie(VISIT_COOKIE, tokens.visitToken, 30 * 60);
        return true;
      })
      .catch((err) => {
        console.warn("[Shopify Analytics] Could not get tracking tokens:", err);
        return false;
      })
      .finally(() => {
        cookiePromise = null;
      });
  }
  return cookiePromise;
}

// ── Events ───────────────────────────────────────────────────────────────────

export interface PageViewDetails {
  pageType: string;
  /** Shopify GID of the product/collection/article being viewed, when there is one. */
  resourceId?: string;
  collectionHandle?: string;
  collectionId?: string;
  searchString?: string;
  products?: TrackedProduct[];
  totalValue?: number;
}

let lastPageView = { key: "", at: 0 };

/** Page view (counts the session). Pass `products` on product pages. */
export async function trackPageView(details: PageViewDetails): Promise<void> {
  if (typeof window === "undefined") return;

  // Same page reported twice in quick succession (React dev double-effects,
  // quick re-renders) is one view, not two.
  const key = `${window.location.href}|${details.pageType}`;
  const now = Date.now();
  if (key === lastPageView.key && now - lastPageView.at < 2000) return;
  lastPageView = { key, at: now };

  if (!(await ensureTrackingCookies())) return;

  await sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload: {
        ...getClientBrowserParameters(),
        hasUserConsent: true,
        shopId: SHOP_ID,
        currency: CURRENCY,
        shopifySalesChannel: "headless",
        ...details,
      },
    } as Parameters<typeof sendShopifyAnalytics>[0]
  );
}

/** Collection viewed from within the shop page (no route change, so no page view fires). */
export async function trackCollectionView(collectionId: string, collectionHandle: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!(await ensureTrackingCookies())) return;

  await sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.COLLECTION_VIEW,
      payload: {
        ...getClientBrowserParameters(),
        hasUserConsent: true,
        shopId: SHOP_ID,
        currency: CURRENCY,
        shopifySalesChannel: "headless",
        pageType: AnalyticsPageType.collection,
        collectionId,
        collectionHandle,
      },
    } as Parameters<typeof sendShopifyAnalytics>[0]
  );
}

export async function trackAddToCart(cartId: string, products: TrackedProduct[]): Promise<void> {
  if (typeof window === "undefined") return;
  if (!(await ensureTrackingCookies())) return;

  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price || "0") * (p.quantity ?? 1), 0);

  await sendShopifyAnalytics(
    {
      eventName: AnalyticsEventName.ADD_TO_CART,
      payload: {
        ...getClientBrowserParameters(),
        hasUserConsent: true,
        shopId: SHOP_ID,
        currency: CURRENCY,
        shopifySalesChannel: "headless",
        cartId,
        totalValue,
        products,
      },
    } as Parameters<typeof sendShopifyAnalytics>[0]
  );
}
