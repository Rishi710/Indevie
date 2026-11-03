import { NextResponse } from 'next/server';
import dns from "dns";

// Force IPv4 resolution first to avoid Node IPv6 connection failures
dns.setDefaultResultOrder("ipv4first");

export const dynamic = 'force-dynamic';

const MAX_PHOTOS = 3;
const MAX_TITLE_LENGTH = 80;

/**
 * Photos must be ones we just stored in our own Vercel Blob store (see
 * /api/reviews/upload). Anything else is ignored, so this route can't be used to
 * make Judge.me fetch arbitrary URLs.
 */
function isOurPhotoUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname.endsWith('.public.blob.vercel-storage.com') &&
      url.pathname.startsWith('/review-photos/')
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const bodyPayload = await request.json();
    const { name, email, rating, reviewTitle, reviewBody, id, pictureUrls } = bodyPayload;

    // 'id' here is the Shopify product ID (external ID)

    if (!name || !email || !rating || !reviewBody || !id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const domain = process.env.JUDGE_ME_SHOP_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.JUDGE_ME_PRIVATE_TOKEN;

    if (!domain || !token) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const pictures: string[] = Array.isArray(pictureUrls)
      ? pictureUrls.filter(isOurPhotoUrl).slice(0, MAX_PHOTOS)
      : [];

    const payload = {
      shop_domain: domain,
      platform: 'shopify',
      api_token: token,
      id: id, // Since platform is 'shopify', this should be the Shopify Product ID
      name: name,
      email: email,
      rating: parseInt(String(rating), 10),
      title: typeof reviewTitle === 'string' ? reviewTitle.trim().slice(0, MAX_TITLE_LENGTH) : "",
      body: String(reviewBody).trim(),
      ...(pictures.length > 0 && { picture_urls: pictures }),
    };

    // Never log the token, the reviewer's email or their text.
    console.log("Submitting review to Judge.me for product", id, "with", pictures.length, "photo(s)");

    const res = await fetch(`https://judge.me/api/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Judge.me Submission Error Status:", res.status);
      console.error("Judge.me Submission Error Body:", errorText);
      return NextResponse.json({
        error: 'Failed to submit review',
        details: errorText
      }, { status: res.status });
    }

    // Judge.me usually returns HTTP 201 Created and the review object inside `review`
    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("Review Submit Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
