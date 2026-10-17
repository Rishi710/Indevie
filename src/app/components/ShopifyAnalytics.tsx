"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";

/**
 * Loads Shopify's own storefront scripts (Customer Privacy API, analytics bus
 * and the storefront analytics script) using Shopify's official helper. This is
 * what makes visits, product views and add-to-carts show up in Shopify
 * Analytics for a headless storefront: it sends page views on load and on every
 * client-side navigation, and receives the product/collection/cart events we
 * publish from src/lib/shopifyAnalytics.ts.
 *
 * Orders aren't reported from here: they're created in Shopify by the GoKwik
 * checkout, which Shopify already counts.
 */
export default function ShopifyAnalytics() {
  return (
    <ShopifyScripts
      shop={{
        shopId: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || "gid://shopify/Shop/64973013058",
        storefrontId: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID || "174241",
        myshopifyDomain: "indevie-beauty.myshopify.com",
      }}
      analytics={{ channel: "headless" }}
      consent={{ mode: "no-banner" }}
      i18n={{ country: "IN", language: "EN", currency: "INR" }}
      webMcp={false}
    />
  );
}
