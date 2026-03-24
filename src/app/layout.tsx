
import "./globals.css";
import { Poppins, Cormorant_Garamond } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
});

const seasons = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-seasons",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${seasons.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}