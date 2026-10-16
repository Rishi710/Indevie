"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsPageType, trackPageView } from "@/lib/shopifyAnalytics";

function pageTypeFor(pathname: string): string {
  if (pathname === "/") return AnalyticsPageType.home;
  if (pathname === "/shop") return AnalyticsPageType.listCollections;
  if (pathname === "/blogs") return AnalyticsPageType.blog;
  if (pathname.startsWith("/blogs/")) return AnalyticsPageType.article;
  if (pathname.startsWith("/search")) return AnalyticsPageType.search;
  if (pathname.startsWith("/account")) return AnalyticsPageType.customersAccount;
  return AnalyticsPageType.page;
}

/**
 * Reports a Shopify Analytics page view on first load and on every client-side
 * navigation. Product pages are skipped here: they send their own page view
 * (ProductPageClient) because Shopify needs the product details attached.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith("/products/")) return;
    trackPageView({ pageType: pageTypeFor(pathname) });
  }, [pathname, searchParams]);

  return null;
}

export default function ShopifyAnalytics() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
