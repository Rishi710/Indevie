import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { toShopifyContentId } from "@/lib/pixel";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

/**
 * Shopify order webhook → Meta CAPI Purchase event.
 *
 * Our checkout redirects to Shopify's own hosted checkout domain
 * (see getSafeCheckoutUrl in src/lib/shopify.ts), so the browser never
 * returns to this app after a purchase — there is no "thank you" page on
 * our domain to fire a client-side Purchase pixel from.
 * GoKwik integration note: GoKwik tracks Purchase natively via its SDK /
 * checkout confirmation with the configured fbPixel. Setting PURCHASE_CAPI_ENABLED
 * to false prevents duplicate purchase & revenue tracking in Meta Ads.
 */
const PURCHASE_CAPI_ENABLED = false;

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const digestBuf = Buffer.from(digest);
  const headerBuf = Buffer.from(hmacHeader);
  if (digestBuf.length !== headerBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, headerBuf);
}

export async function POST(request: NextRequest) {
  // Wrapped end-to-end: a webhook Shopify will retry on any non-2xx should
  // never 500 from an unexpected exception (we saw one in production with no
  // stack trace surfaced) — log whatever breaks and still ack the request.
  try {
    return await handleShopifyOrderWebhook(request);
  } catch (error) {
    console.error("[Shopify Webhook] Unhandled exception:", error);
    return NextResponse.json({ error: "Internal error", received: true }, { status: 200 });
  }
}

async function handleShopifyOrderWebhook(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Shopify Webhook] SHOPIFY_WEBHOOK_SECRET is not configured — rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // HMAC is computed over the exact raw bytes Shopify sent — must read as text
  // before any JSON parsing, which could reformat and invalidate the signature.
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyWebhook(rawBody, hmacHeader, secret)) {
    console.warn("[Shopify Webhook] Invalid HMAC signature — rejecting.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let order: any;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Shopify marks orders placed through the test/Bogus payment gateway with
  // test: true. These are visible in Admin only behind a filter and can be
  // deleted outright, unlike real orders — so letting them through here would
  // report phantom revenue to Meta that can never be reconciled against Shopify.
  if (order.test) {
    return NextResponse.json({ received: true, skipped: "test order" });
  }

  if (!PURCHASE_CAPI_ENABLED) {
    return NextResponse.json({ received: true, skipped: "Purchase CAPI disabled — handled by Facebook & Instagram channel" });
  }

  try {
    const lineItems: any[] = Array.isArray(order.line_items) ? order.line_items : [];
    const contentIds = lineItems
      .map((li) =>
        li.product_id
          ? toShopifyContentId(String(li.product_id), li.variant_id ? String(li.variant_id) : null)
          : null
      )
      .filter((id): id is string => !!id);

    const numItems = lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0);
    const value = parseFloat(order.current_total_price ?? order.total_price ?? "0");
    const currency = order.currency || "INR";
    const orderId = String(order.id ?? order.order_number ?? "");

    // event_id is deterministic per order so Shopify's automatic webhook
    // retries (on non-2xx responses) can never double-count a Purchase in Meta.
    const result = await sendMetaCapiEvent({
      eventName: "Purchase",
      eventId: `order-${orderId}`,
      eventData: {
        content_ids: contentIds,
        content_type: "product",
        value,
        currency,
        num_items: numItems,
        order_id: orderId,
      },
      sourceUrl: order.order_status_url || "",
      userData: {
        clientIp: order.client_details?.browser_ip,
        userAgent: order.client_details?.user_agent,
        email: order.email || order.customer?.email,
        phone: order.phone || order.customer?.phone,
      },
    });

    if (!result.success) {
      console.error(`[Shopify Webhook] CAPI Purchase relay failed for order ${orderId}:`, result.error);
    } else {
      // Logged so a Purchase sent to Meta can be matched back to the exact
      // Shopify order (name/number as shown in Admin) and its real total —
      // Ads Manager only shows aggregate counts, not which order is which.
      console.log(
        `[Shopify Webhook] Purchase sent to Meta — order ${order.name || orderId} (#${order.order_number ?? "?"}), value ${currency} ${value}, event_id order-${orderId}`
      );
    }
  } catch (error) {
    // Never fail this response over a downstream Meta issue — Shopify would
    // retry and, since HMAC already passed, disabling the webhook after
    // repeated failures would be worse than silently logging this one.
    console.error("[Shopify Webhook] Failed to process order for Meta CAPI:", error);
  }

  return NextResponse.json({ received: true });
}
