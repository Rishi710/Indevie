import crypto from "crypto";

/**
 * Server-side Meta Conversions API sender. Shared by the browser-event relay
 * (/api/meta-events) and the Shopify order webhook (/api/webhooks/shopify-order)
 * so both send identically-shaped, correctly-hashed payloads to the same place.
 */

const GRAPH_API_VERSION = "v19.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaCapiUserData {
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  /** Raw email — hashed (SHA-256) before it ever leaves the server, per Meta's requirements. */
  email?: string;
  /** Raw phone — digits-only + hashed (SHA-256) before it ever leaves the server. */
  phone?: string;
}

export interface MetaCapiEventData {
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  order_id?: string;
}

export interface MetaCapiEventInput {
  eventName: string;
  /** Stable, deterministic per logical event (e.g. `order-<id>`) so retries/duplicates dedupe in Meta. */
  eventId: string;
  eventData?: MetaCapiEventData;
  sourceUrl?: string;
  userData: MetaCapiUserData;
}

export interface MetaCapiResult {
  success: boolean;
  warning?: string;
  error?: unknown;
}

export async function sendMetaCapiEvent(input: MetaCapiEventInput): Promise<MetaCapiResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId) {
    console.warn("[Meta CAPI] NEXT_PUBLIC_META_PIXEL_ID is not configured.");
    return { success: false, error: "Pixel ID not configured" };
  }

  const user_data: Record<string, unknown> = {};
  if (input.userData.clientIp) user_data.client_ip_address = input.userData.clientIp;
  if (input.userData.userAgent) user_data.client_user_agent = input.userData.userAgent;
  if (input.userData.fbp) user_data.fbp = input.userData.fbp;
  if (input.userData.fbc) user_data.fbc = input.userData.fbc;
  if (input.userData.email) user_data.em = [sha256(input.userData.email)];
  if (input.userData.phone) {
    const digitsOnly = input.userData.phone.replace(/[^\d]/g, "");
    if (digitsOnly) user_data.ph = [sha256(digitsOnly)];
  }

  const capiEvent: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    event_source_url: input.sourceUrl || "",
    action_source: "website",
    user_data,
  };

  if (input.eventData) {
    capiEvent.custom_data = {
      content_ids: input.eventData.content_ids || [],
      content_type: input.eventData.content_type || "product",
      value: input.eventData.value,
      currency: input.eventData.currency || "INR",
      content_name: input.eventData.content_name,
      num_items: input.eventData.num_items,
      order_id: input.eventData.order_id,
    };
  }

  if (!accessToken) {
    console.warn(
      `[Meta CAPI] META_ACCESS_TOKEN is missing — ${input.eventName} (${input.eventId}) was NOT sent to Meta, only simulated. Generate a Conversions API token in Events Manager → Settings and add it to your env as META_ACCESS_TOKEN.`
    );
    return { success: true, warning: "META_ACCESS_TOKEN not set, event simulated" };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [capiEvent], access_token: accessToken }),
    });
    const result = await response.json();

    if (!response.ok) {
      console.error(`[Meta CAPI] Graph API rejected ${input.eventName} (${input.eventId}):`, result);
      return { success: false, error: result };
    }

    return { success: true };
  } catch (error) {
    console.error(`[Meta CAPI] Request failed for ${input.eventName} (${input.eventId}):`, error);
    return { success: false, error };
  }
}
