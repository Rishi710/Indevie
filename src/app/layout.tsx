import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";
import { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import MetaPixel from "./components/MetaPixel";
import Script from "next/script";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const GOKWIK_MERCHANT_ID = process.env.NEXT_PUBLIC_GOKWIK_MERCHANT_ID;
const GOKWIK_ENVIRONMENT = process.env.NEXT_PUBLIC_GOKWIK_ENVIRONMENT || "sandbox";
const GOKWIK_STORE_ID = process.env.NEXT_PUBLIC_GOKWIK_STORE_ID;

export const metadata: Metadata = {
  title: "Indevie Beauty | Modern Botanical Skincare rooted in Genurveda™",
  description: "Discover Indevie Beauty's range of clean, effective, and intentional skincare rituals. Built with intention, backed by conviction.",
  keywords: ["skincare", "botanical beauty", "Genurveda", "clean beauty", "intentional skincare"],
  other: {
    "facebook-domain-verification": "m2b63pt96o6nhkqkt1wk154bcexgf2",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customerAccessToken")?.value;
  const isLoggedIn = !!token;

  let userName = null;
  if (isLoggedIn && token) {
    const customer = await fetchCustomer(token);
    userName = customer?.firstName || null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} ${inter.variable} antialiased font-sans bg-[#f5f1e6]`} suppressHydrationWarning>
        <LayoutWrapper isLoggedIn={isLoggedIn} userName={userName}>
          {children}
        </LayoutWrapper>
        <Analytics />
        <MetaPixel />
        {GOKWIK_MERCHANT_ID && GOKWIK_STORE_ID && (
          <>
            {/* GoKwik's own script reads window.merchantInfo synchronously at
                the top of its execution (confirmed by inspecting their bundle:
                `const d = window.merchantInfo; ...ot(d.environment)...`) -- if
                merchantInfo isn't set yet at that exact moment, it's captured
                as undefined forever and their init silently never runs. Both
                scripts must be beforeInteractive (root-layout only, per
                Next.js) and in this exact order so merchantInfo is guaranteed
                to exist before their SDK's own code executes. */}
            <Script
              id="gokwik-merchant-info"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.merchantInfo = ${JSON.stringify({
                  mid: GOKWIK_MERCHANT_ID,
                  environment: GOKWIK_ENVIRONMENT,
                  type: "merchantInfo",
                  storeId: Number(GOKWIK_STORE_ID),
                  fbPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
                })};`,
              }}
            />
            <Script
              id="gokwik-merchant-integration"
              src="https://pdp.gokwik.co/merchant-integration/build/merchant.integration.js?v4"
              strategy="beforeInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}