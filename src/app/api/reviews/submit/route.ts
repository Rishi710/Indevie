import { NextResponse } from 'next/server';
import dns from "dns";

// Force IPv4 resolution first to avoid Node IPv6 connection failures
dns.setDefaultResultOrder("ipv4first");

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const bodyPayload = await request.json();
    const { name, email, rating, reviewBody, location, age, id } = bodyPayload;

    // 'id' here is the Shopify product ID (external ID)

    if (!name || !email || !rating || !reviewBody || !id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const domain = process.env.JUDGE_ME_SHOP_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.JUDGE_ME_PRIVATE_TOKEN;

    if (!domain || !token) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Format location and age perfectly into the review payload
    const formattedBody = `${reviewBody}\n\n---\n🌍 Location: ${location || 'N/A'}\n👤 Age: ${age || 'N/A'}`;

    const payload = {
      shop_domain: domain,
      platform: 'shopify',
      api_token: token,
      id: id, // Since platform is 'shopify', this should be the Shopify Product ID
      name: name,
      email: email,
      rating: parseInt(String(rating), 10),
      title: "",
      body: formattedBody,
    };

    console.log("Submitting review to Judge.me with payload:", { ...payload, api_token: '***' });

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

    const data = await res.json();
    console.log("Judge.me Submission Success:", data);
    // Judge.me usually returns HTTP 201 Created and the review object inside `review`
    return NextResponse.json({ success: true, data: data }, { status: 201 });

  } catch (error) {
    console.error("Review Submit Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
