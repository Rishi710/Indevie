import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

    if (!domain || !storefrontAccessToken) {
      return NextResponse.json({ error: "Missing env configuration" }, { status: 500 });
    }

    const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Shopify proxy error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch from Shopify" }, { status: 500 });
  }
}
