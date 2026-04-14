import { NextResponse } from 'next/server';

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
      id: id,
      name: name,
      email: email,
      rating: parseInt(rating, 10),
      title: "",
      body: formattedBody,
    };

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
      console.error("Judge.me Submission Error:", errorText);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: res.status });
    }

    const data = await res.json();
    // Judge.me usually returns HTTP 201 Created and the review object inside `review`
    return NextResponse.json({ success: true, data: data }, { status: 201 });

  } catch (error) {
    console.error("Review Submit Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
