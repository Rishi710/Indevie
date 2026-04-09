import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("customerAccessToken");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-[#f5f1e6]" suppressHydrationWarning>
        <LayoutWrapper isLoggedIn={isLoggedIn}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}