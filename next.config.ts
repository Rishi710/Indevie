import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // See scripts/webpack-ignore-url-imports.js — lets @shopify/hydrogen load
  // Shopify's analytics module from their CDN at runtime.
  webpack: (config) => {
    config.module.rules.push({
      test: /[\\/]node_modules[\\/]@shopify[\\/]hydrogen[\\/].*\.mjs$/,
      enforce: "pre",
      loader: path.join(process.cwd(), "scripts", "webpack-ignore-url-imports.js"),
    });
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "indewild.com",
      },
      {
        protocol: "https",
        hostname: "www.instagram.com",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
  },
};

export default nextConfig;
