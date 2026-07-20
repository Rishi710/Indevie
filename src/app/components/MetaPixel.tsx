"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { pixelPageView } from "@/lib/pixel";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Inner component that fires PageView on every client-side route change.
 * Must be wrapped in <Suspense> because useSearchParams requires it in Next.js 15+.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pixelPageView();
  }, [pathname, searchParams]);

  return null;
}

/**
 * MetaPixel — drop this into the root layout <body>.
 * Injects the base fbq script once and fires PageView on every navigation.
 */
export default function MetaPixel() {
  if (!PIXEL_ID) {
    console.warn("[MetaPixel] NEXT_PUBLIC_META_PIXEL_ID is not set. Pixel will not fire.");
    return null;
  }

  return (
    <>
      {/* Base Pixel Script — loads once */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            if (!/^(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)$/.test(window.location.hostname)) {
              fbq('init', '${PIXEL_ID}');
            }
          `,
        }}
      />

      {/* NoScript fallback for browsers without JS */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Route change PageView tracker */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
