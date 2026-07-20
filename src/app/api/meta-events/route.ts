import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, eventData, sourceUrl, userAgent, fbp, fbc } = body;

    // Get client IP address from headers
    const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const ip = rawIp ? rawIp.split(",")[0].trim() : "127.0.0.1";
    const clientUserAgent = userAgent || request.headers.get("user-agent") || "";

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventData,
      sourceUrl,
      userData: { clientIp: ip, userAgent: clientUserAgent, fbp, fbc },
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, warning: result.warning });
  } catch (error: any) {
    console.error("[Meta CAPI API] Error handling Conversions API request:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
