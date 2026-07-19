import { NextResponse } from "next/server";
import dns from "dns";

// Force IPv4 resolution first to avoid Node IPv6 connection failures
dns.setDefaultResultOrder("ipv4first");

// This route relays browser requests to Shopify's Storefront API so the
// storefront token never appears in client-side network calls. It must only
// ever forward the specific read/cart operations our client code actually
// issues (see src/lib/shopify.ts and SearchBar.tsx) — never customer/account
// mutations (login, register, password reset, etc.), which always run
// server-side via server actions and never touch this route. Without this
// allowlist, this endpoint would be an open relay letting anyone send
// arbitrary GraphQL (including customer mutations) to Shopify through our
// server and token.
const ALLOWED_OPERATIONS = new Set([
  "getProducts",
  "getCollections",
  "getCollectionProducts",
  "getSearchProducts",
  "getCart",
  "cartCreate",
  "cartLinesAdd",
  "cartLinesUpdate",
  "cartLinesRemove",
  "cartBuyerIdentityUpdate",
]);

function getOperationName(query: unknown): string | null {
  if (typeof query !== "string") return null;
  const match = query.match(/^\s*(?:query|mutation)\s+(\w+)/);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

    if (!domain || !storefrontAccessToken) {
      return NextResponse.json({ error: "Missing env configuration" }, { status: 500 });
    }

    const operationName = getOperationName(body?.query);
    if (!operationName || !ALLOWED_OPERATIONS.has(operationName)) {
      return NextResponse.json({ error: "Operation not permitted" }, { status: 403 });
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
