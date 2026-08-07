"use client";

import Script from "next/script";

const MERCHANT_ID = process.env.NEXT_PUBLIC_GOKWIK_MERCHANT_ID;
const ENVIRONMENT = process.env.NEXT_PUBLIC_GOKWIK_ENVIRONMENT || "sandbox";
const STORE_ID = process.env.NEXT_PUBLIC_GOKWIK_STORE_ID;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Loads GoKwik's custom-storefront checkout SDK and configures window.merchantInfo
 * -- drop into the root layout <body>, same pattern as MetaPixel.
 */
export default function GoKwikScript() {
  if (!MERCHANT_ID || !STORE_ID) {
    console.warn("[GoKwik] NEXT_PUBLIC_GOKWIK_MERCHANT_ID or NEXT_PUBLIC_GOKWIK_STORE_ID is not set. GoKwik checkout will not be available.");
    return null;
  }

  return (
    <Script
      id="gokwik-merchant-integration"
      src="https://pdp.gokwik.co/merchant-integration/build/merchant.integration.js?v4"
      strategy="afterInteractive"
      onLoad={() => {
        window.merchantInfo = {
          mid: MERCHANT_ID,
          environment: ENVIRONMENT as "production" | "sandbox",
          type: "merchantInfo",
          storeId: Number(STORE_ID),
          fbPixel: FB_PIXEL_ID,
        };
      }}
    />
  );
}
