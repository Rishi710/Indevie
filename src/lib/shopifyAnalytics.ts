/**
 * Shopify Analytics events for the headless storefront.
 *
 * Page views are sent automatically by <ShopifyAnalytics /> (Shopify's own
 * scripts). Product views, collection views and add-to-carts have to be
 * published by us onto Shopify's analytics bus (`window.Shopify.analytics`),
 * which holds them until the visitor's consent state is known and then ships
 * them to Shopify. Everything is a no-op if the bus isn't there (SSR, blocked
 * script), so tracking can never break the storefront.
 */

type Publish = (eventName: string, payload?: unknown) => void;

function publish(eventName: string, payload: unknown): void {
  if (typeof window === "undefined") return;
  try {
    const bus = (window as unknown as { Shopify?: { analytics?: { publish?: Publish } } }).Shopify?.analytics;
    bus?.publish?.(eventName, payload);
  } catch (error) {
    console.warn("[Shopify Analytics] publish failed:", error);
  }
}

export interface AnalyticsProduct {
  id: string;
  title: string;
  vendor: string;
  productType?: string;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity?: number;
  sku?: string | null;
}

let lastProductView = { id: "", at: 0 };

export function publishProductViewed(product: AnalyticsProduct): void {
  // Same product reported twice in quick succession is one view, not two.
  const now = Date.now();
  if (product.id === lastProductView.id && now - lastProductView.at < 2000) return;
  lastProductView = { id: product.id, at: now };

  publish("product_viewed", {
    products: [{ ...product, quantity: product.quantity ?? 1 }],
  });
}

export function publishCollectionViewed(id: string, handle: string): void {
  publish("collection_viewed", { collection: { id, handle } });
}

/** Shape of a cart line as returned by our Storefront cart queries. */
interface CartLineLike {
  id: string;
  quantity: number;
  merchandise?: {
    id: string;
    title?: string;
    price?: { amount: string; currencyCode?: string };
    product?: { id: string; title: string; vendor?: string; productType?: string; handle?: string };
  };
}

function toAnalyticsLine(line: CartLineLike, quantity = line.quantity) {
  const m = line.merchandise;
  return {
    id: line.id,
    quantity,
    merchandise: {
      id: m?.id ?? "",
      title: m?.title ?? "",
      price: { amount: m?.price?.amount ?? "0", currencyCode: m?.price?.currencyCode },
      sku: null,
      product: {
        id: m?.product?.id ?? "",
        title: m?.product?.title ?? "",
        vendor: m?.product?.vendor ?? "",
        productType: m?.product?.productType,
        handle: m?.product?.handle,
      },
    },
  };
}

/**
 * @param cart  The cart after the add.
 * @param line  The cart line that was added to.
 * @param added How many units this action added (the line may already have had some).
 */
export function publishAddToCart(
  cart: { id: string; lines?: { nodes?: CartLineLike[] } } | null,
  line: CartLineLike,
  added: number
): void {
  if (!cart) return;
  const previousQuantity = Math.max(line.quantity - added, 0);

  publish("product_added_to_cart", {
    cart: {
      id: cart.id,
      updatedAt: new Date().toISOString(),
      lines: { nodes: (cart.lines?.nodes ?? []).map((l) => toAnalyticsLine(l)) },
    },
    prevCart: null,
    currentLine: toAnalyticsLine(line),
    ...(previousQuantity > 0 && { prevLine: toAnalyticsLine(line, previousQuantity) }),
  });
}
