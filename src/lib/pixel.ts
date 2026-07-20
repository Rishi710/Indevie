/**
 * Meta Pixel (Facebook Pixel) + Conversions API Utility
 * ──────────────────────────────────────────────────────
 * Every event is dual-fired:
 *   1. Browser-side fbq  — works for users who allow tracking
 *   2. Server-side CAPI via /api/meta-events — bypasses ad-blockers & iOS ITP
 * Both sides share the same event_id so Meta deduplicates correctly (counts as 1 event).
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

// ── ID Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts Shopify GIDs to the "shopify_IN_<productId>_<variantId>" format
 * that the Shopify → Meta Catalog sync uses as the canonical content ID.
 *
 * - Product GID  → gid://shopify/Product/123       → shopify_IN_123_<variantId>
 * - Variant GID  → gid://shopify/ProductVariant/456 → shopify_IN_<productId>_456
 *
 * Pass BOTH product and variant GIDs for the most precise match.
 */
export function toShopifyContentId(
  productGid: string,
  variantGid?: string | null
): string {
  const country = "IN"; // Change if your store targets a different country
  const productId = productGid.split("/").pop() || productGid;
  const variantId = variantGid ? variantGid.split("/").pop() : productId;
  return `shopify_${country}_${productId}_${variantId}`;
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

/** Generates a universally unique event ID for browser ↔ server deduplication */
function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Safely reads a browser cookie by name (returns empty string in SSR) */
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

/**
 * True on localhost/dev origins. All exported event functions below no-op
 * here so local testing never pollutes the real Meta dataset / catalog
 * match-rate metrics with dev traffic (this is how "localhost:3000" source
 * URLs end up as unmatched events in Meta Commerce Manager).
 */
function isLocalOrigin(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
}

/**
 * Sends an event to our /api/meta-events relay which forwards it to
 * Meta's Conversions API from the server.
 * This is non-blocking — UX is never delayed if CAPI fails.
 */
async function sendCapiEvent(
  eventName: string,
  eventId: string,
  eventData: Record<string, any>
): Promise<void> {
  try {
    await fetch("/api/meta-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        eventData,
        sourceUrl: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        fbp: getCookie("_fbp"),  // Meta's first-party cookie — set automatically by pixel
        fbc: getCookie("_fbc"),  // Set when user clicks a Facebook/Instagram ad
      }),
    });
  } catch (e) {
    // CAPI is supplemental — never block UX on failure
    console.warn("[Meta CAPI] Failed to relay server event:", e);
  }
}

/** Fires a browser-side fbq event with an event ID for deduplication */
function fireBrowserPixel(
  eventName: string,
  data: Record<string, any>,
  eventId: string
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", eventName, data, { eventID: eventId });
}

// ── Standard Events ──────────────────────────────────────────────────────────

/** PageView — fire on every route change */
export function pixelPageView(): void {
  if (isLocalOrigin()) return;
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}

/**
 * ViewContent — fire when a product detail page is loaded.
 * Dual-fires: browser pixel + server-side CAPI.
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
}): void {
  if (isLocalOrigin()) return;
  const eventId = generateEventId();
  const eventData = {
    content_ids: [toShopifyContentId(id, variantId)],
    content_name: title,
    content_type: "product",
    value: parseFloat(price),
    currency: currencyCode,
  };

  fireBrowserPixel("ViewContent", eventData, eventId);
  sendCapiEvent("ViewContent", eventId, eventData);
}

/**
 * AddToCart — fire when a user adds a product to the cart.
 * Dual-fires: browser pixel + server-side CAPI.
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
}): void {
  if (isLocalOrigin()) return;
  const eventId = generateEventId();
  const eventData = {
    content_ids: [toShopifyContentId(id, variantId)],
    content_name: title,
    content_type: "product",
    value: parseFloat(price) * quantity,
    currency: currencyCode,
    num_items: quantity,
  };

  fireBrowserPixel("AddToCart", eventData, eventId);
  sendCapiEvent("AddToCart", eventId, eventData);
}

/**
 * InitiateCheckout — fire when user clicks "Proceed to Checkout".
 * Dual-fires: browser pixel + server-side CAPI.
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
}): void {
  if (isLocalOrigin()) return;
  const eventId = generateEventId();
  const eventData = {
    content_ids: contentIds,
    content_type: "product",
    num_items: numItems,
    value,
    currency: currencyCode,
  };

  fireBrowserPixel("InitiateCheckout", eventData, eventId);
  sendCapiEvent("InitiateCheckout", eventId, eventData);
}

/**
 * Purchase — fire after a successful order is placed.
 * Typically called on an order-confirmation/thank-you page.
 * Dual-fires: browser pixel + server-side CAPI.
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
}): void {
  if (isLocalOrigin()) return;
  const eventId = generateEventId();
  const eventData = {
    content_ids: contentIds,
    content_type: "product",
    value,
    currency: currencyCode,
    num_items: numItems,
    order_id: orderId,
  };

  fireBrowserPixel("Purchase", eventData, eventId);
  sendCapiEvent("Purchase", eventId, eventData);
}
