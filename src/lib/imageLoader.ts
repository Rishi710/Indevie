"use client";

/**
 * Global image loader for next/image (see images.loaderFile in next.config.ts).
 *
 * Almost every image on the site (products, banners, logos) lives on Shopify's
 * CDN, which resizes images itself for free. Routing those through Vercel's
 * image optimizer used up the plan's 5,000 monthly "transformations" in days and
 * got the project paused, so Shopify images now ask Shopify for the size they
 * need and never touch Vercel's optimizer.
 *
 * Everything else is served as-is. With a custom loader Next's built-in
 * /_next/image optimizer is no longer available, so our own files in
 * /public/images are pre-compressed to web size instead (~100-400 KB each).
 * Keep any new local image small (max ~2000px wide, JPEG/WebP).
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }

  return src;
}
