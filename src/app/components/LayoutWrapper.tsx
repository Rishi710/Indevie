"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
}

export default function LayoutWrapper({ children, isLoggedIn }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Define routes that should NOT have Header and Footer
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authRoutes.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      {children}
      <Footer />
    </>
  );
}
