/**
 * Meta Pixel (Facebook Pixel) Utility
 * ─────────────────────────────────────
 * Provides type-safe wrappers for firing standard Meta Pixel events.
 * The base pixel script is injected via MetaPixelScript in layout.tsx.
 *
 * Usage:
 *   import { pixelPageView, pixelViewContent, pixelAddToCart, pixelInitiateCheckout } from "@/lib/pixel";
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

/**
 * Converts a Shopify GID to the "shopify_IN_<productId>_<variantId>" format
 * that the Shopify → Meta Catalog sync uses as the canonical content ID.
 *
 * - Product GID  → `gid://shopify/Product/123`         → `shopify_IN_123_<variantId>`
 * - Variant GID  → `gid://shopify/ProductVariant/456`   → `shopify_IN_<productId>_456`
 *
 * Pass BOTH product and variant GIDs for the most precise match.
 */
export function toShopifyContentId(
  productGid: string,
  variantGid?: string | null
): string {
  const country = "IN"; // Change to match your store's target country if needed
  const productId = productGid.split("/").pop() || productGid;
  const variantId = variantGid ? variantGid.split("/").pop() : productId;
  return `shopify_${country}_${productId}_${variantId}`;
}

/** Fire a standard fbq event safely (no-ops if fbq hasn't loaded yet) */
function fbq(eventType: "track" | "trackCustom" | "init", eventName: string, data?: Record<string, any>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (data) {
    window.fbq(eventType, eventName, data);
  } else {
    window.fbq(eventType, eventName);
  }
}

// ── Standard Events ──────────────────────────────────────────────────────────

/** PageView — fire on every route change */
export function pixelPageView() {
  fbq("track", "PageView");
}

/**
 * ViewContent — fire when a product detail page is loaded.
 * @param product Product data from Shopify
 */
export function pixelViewContent({
  id,
  variantId,
  title,
  price,
  currencyCode = "INR",
}: {
  id: string;
  variantId?: string | null;
  title: string;
  price: string;
  currencyCode?: string;
}) {
  fbq("track", "ViewContent", {
    content_ids: [toShopifyContentId(id, variantId)],
    content_name: title,
    content_type: "product",
    value: parseFloat(price),
    currency: currencyCode,
  });
}

/**
 * AddToCart — fire when a user adds a product to the cart.
 */
export function pixelAddToCart({
  id,
  variantId,
  title,
  price,
  currencyCode = "INR",
  quantity = 1,
}: {
  id: string;
  variantId?: string | null;
  title: string;
  price: string;
  currencyCode?: string;
  quantity?: number;
}) {
  fbq("track", "AddToCart", {
    content_ids: [toShopifyContentId(id, variantId)],
    content_name: title,
    content_type: "product",
    value: parseFloat(price) * quantity,
    currency: currencyCode,
    num_items: quantity,
  });
}

/**
 * InitiateCheckout — fire when user clicks "Proceed to Checkout".
 */
export function pixelInitiateCheckout({
  numItems,
  value,
  currencyCode = "INR",
  contentIds,
}: {
  numItems: number;
  value: number;
  currencyCode?: string;
  contentIds: string[];
}) {
  fbq("track", "InitiateCheckout", {
    content_ids: contentIds,
    content_type: "product",
    num_items: numItems,
    value,
    currency: currencyCode,
  });
}

/**
 * Purchase — fire after a successful order is placed.
 * Typically called on an order-confirmation/thank-you page.
 */
export function pixelPurchase({
  orderId,
  value,
  currencyCode = "INR",
  contentIds,
  numItems,
}: {
  orderId: string;
  value: number;
  currencyCode?: string;
  contentIds: string[];
  numItems: number;
}) {
  fbq("track", "Purchase", {
    content_ids: contentIds,
    content_type: "product",
    value,
    currency: currencyCode,
    num_items: numItems,
    order_id: orderId,
  });
}
