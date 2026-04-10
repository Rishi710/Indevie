"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

interface LayoutWrapperProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  userName?: string | null;
}

export default function LayoutWrapper({ children, isLoggedIn, userName }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Define routes that should NOT have Header and Footer
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authRoutes.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <CartDrawer />
      {children}
      <Footer />
    </CartProvider>
  );
}
