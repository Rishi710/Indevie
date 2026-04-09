import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { cookies } from "next/headers";
import { fetchCustomer } from "@/lib/shopify";

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
      <body className="antialiased font-sans bg-[#f5f1e6]" suppressHydrationWarning>
        <LayoutWrapper isLoggedIn={isLoggedIn} userName={userName}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}