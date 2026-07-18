import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, eventData, sourceUrl, userAgent, fbp, fbc } = body;

    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId) {
      console.warn("[Meta CAPI API] NEXT_PUBLIC_META_PIXEL_ID is not configured.");
      return NextResponse.json({ success: false, error: "Pixel ID not configured" }, { status: 400 });
    }

    // Get client IP address from headers
    const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const ip = rawIp ? rawIp.split(",")[0].trim() : "127.0.0.1";

    const clientUserAgent = userAgent || request.headers.get("user-agent") || "";

    // Build the Meta Conversions API Payload
    const capiEvent: Record<string, any> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl || "",
      action_source: "website",
      user_data: {
        client_ip_address: ip,
        client_user_agent: clientUserAgent,
      },
    };

    // Include first-party cookies if available
    if (fbp) {
      capiEvent.user_data.fbp = fbp;
    }
    if (fbc) {
      capiEvent.user_data.fbc = fbc;
    }

    // Map custom event properties to Meta's custom_data keys
    if (eventData) {
      capiEvent.custom_data = {
        content_ids: eventData.content_ids || [],
        content_type: eventData.content_type || "product",
        value: eventData.value ? parseFloat(eventData.value) : undefined,
        currency: eventData.currency || "INR",
        content_name: eventData.content_name || undefined,
        num_items: eventData.num_items || undefined,
        order_id: eventData.order_id || undefined,
      };
    }

    // Log the CAPI payload for debugging during local testing
    console.log(`[Meta CAPI API] Prepared event: ${eventName} (Event ID: ${eventId})`, JSON.stringify(capiEvent, null, 2));

    if (!accessToken) {
      console.warn("[Meta CAPI API] META_ACCESS_TOKEN is missing. Server-side event skipped but simulated successfully.");
      return NextResponse.json({ success: true, warning: "META_ACCESS_TOKEN not set, event simulated" });
    }

    // Send request to Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [capiEvent],
        access_token: accessToken,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta CAPI API] Meta Graph API returned error:", result);
      return NextResponse.json({ success: false, error: result }, { status: response.status });
    }

    console.log("[Meta CAPI API] Successfully dispatched server event:", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[Meta CAPI API] Error handling Conversions API request:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
