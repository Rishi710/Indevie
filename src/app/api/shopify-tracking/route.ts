import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Issues Shopify's visitor/session tracking tokens (the values behind the
 * `_shopify_y` / `_shopify_s` cookies) so our headless storefront can report
 * sessions, page views and add-to-carts to Shopify Analytics.
 *
 * The `consentManagement` field only exists on the Storefront API's `unstable`
 * version, so this is kept in its own tiny route instead of the shared client.
 * Existing tokens are echoed back to Shopify so a returning visitor keeps the
 * same identity instead of being counted as new.
 */
export async function POST(req: Request) {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let uniqueToken = "";
  let visitToken = "";
  try {
    const body = await req.json();
    uniqueToken = typeof body?.uniqueToken === "string" ? body.uniqueToken : "";
    visitToken = typeof body?.visitToken === "string" ? body.visitToken : "";
  } catch {
    // No body — treat as a brand-new visitor.
  }

  try {
    const res = await fetch(`https://${domain}/api/unstable/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
        ...(uniqueToken && { "X-Shopify-UniqueToken": uniqueToken }),
        ...(visitToken && { "X-Shopify-VisitToken": visitToken }),
      },
      body: JSON.stringify({
        query:
          "query ensureCookies { consentManagement { cookies(visitorConsent: {}) { shopifyUnique shopifyVisit } } }",
      }),
      cache: "no-store",
    });
    const json = await res.json();
    const cookies = json?.data?.consentManagement?.cookies;
    if (!cookies?.shopifyUnique || !cookies?.shopifyVisit) {
      return NextResponse.json({ error: "No tracking tokens returned" }, { status: 502 });
    }
    return NextResponse.json({ uniqueToken: cookies.shopifyUnique, visitToken: cookies.shopifyVisit });
  } catch (error) {
    console.error("[Shopify tracking] Failed to fetch tracking tokens:", error);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
