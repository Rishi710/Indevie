import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";
import { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Indévie Beauty | Modern Botanical Skincare rooted in Genurveda™",
  description: "Discover Indévie Beauty's range of clean, effective, and intentional skincare rituals. Built with intention, backed by conviction.",
  keywords: ["skincare", "botanical beauty", "Genurveda", "clean beauty", "intentional skincare"],
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
      <body className={`${inter.variable} ${poppins.variable} antialiased font-sans bg-[#f5f1e6]`} suppressHydrationWarning>
        <LayoutWrapper isLoggedIn={isLoggedIn} userName={userName}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}