import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";
import { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import MetaPixel from "./components/MetaPixel";
import GoKwikScript from "./components/GoKwikScript";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Indévie Beauty | Modern Botanical Skincare rooted in Genurveda™",
  description: "Discover Indévie Beauty's range of clean, effective, and intentional skincare rituals. Built with intention, backed by conviction.",
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
        <GoKwikScript />
      </body>
    </html>
  );
}