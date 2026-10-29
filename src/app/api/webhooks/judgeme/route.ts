import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { JUDGEME_REVIEWS_TAG } from "@/lib/judgeme";

export const dynamic = "force-dynamic";

/**
 * Judge.me webhook: called when a review is created or changed. It refreshes the
 * shared cached copy of reviews so the new review shows on the site within
 * minutes, without the site having to poll Judge.me.
 *
 * Judge.me signs each request with HMAC-SHA256 of the raw body (header
 * `JUDGEME-HMAC-SHA256`); for webhooks created with the store's private API
 * token, that token is the signing secret.
 */
function isValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.trim().toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.JUDGE_ME_PRIVATE_TOKEN;
  if (!secret) {
    console.error("[Judge.me webhook] JUDGE_ME_PRIVATE_TOKEN is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("judgeme-hmac-sha256") ||
    request.headers.get("x-judgeme-hmac-sha256");

  if (!isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Expire immediately so the very next request fetches fresh reviews.
  revalidateTag(JUDGEME_REVIEWS_TAG, { expire: 0 });
  return NextResponse.json({ received: true });
}
