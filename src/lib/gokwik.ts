/**
 * GoKwik custom-storefront checkout (Scenario 2 from GoKwik's integration doc:
 * we have no Shopify-like cart.js REST endpoints, so we pass our real Storefront
 * API cart ID into their SDK instead of redirecting to Shopify's hosted checkout).
 */

declare global {
  interface Window {
    merchantInfo?: {
      mid: string;
      environment: "production" | "sandbox";
      type: "merchantInfo";
      storeId: number;
      fbPixel?: string;
      cart?: { id: string };
    };
    triggerGokwikCustomCheckout?: () => void;
    gokwikSdk?: unknown;
  }
}

/** True once GoKwik's SDK script has finished loading and registered its checkout trigger. */
export function isGokwikReady(): boolean {
  return typeof window !== "undefined" && typeof window.triggerGokwikCustomCheckout === "function";
}

/**
 * Opens GoKwik's checkout for the given Shopify cart instead of redirecting to
 * Shopify's own hosted checkout. `cartId` must be the real Storefront API cart
 * ID (already in `gid://shopify/Cart/<id>` form -- that's what Shopify's Cart
 * `id` field returns natively, no reformatting needed).
 *
 * Returns false (and logs why) if the SDK hasn't loaded yet, so the caller can
 * fall back or show the user something sensible instead of a silent no-op.
 */
export function triggerGokwikCheckout(cartId: string): boolean {
  if (!isGokwikReady() || !window.merchantInfo) {
    console.error("[GoKwik] SDK not loaded yet -- cannot trigger checkout.");
    return false;
  }

  window.merchantInfo.cart = { id: cartId };
  window.triggerGokwikCustomCheckout!();
  return true;
}
