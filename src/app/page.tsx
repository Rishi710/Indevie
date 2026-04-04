export const dynamic = "force-dynamic";
import Image from "next/image";

import HeroSlider from "./components/HeroSlider";
import UgcSection from "./components/UgcSection";
import BlogsCarousel from "./components/BlogsCarousel";

export default function Home() {
  console.log("STORE:", process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
  return (
    <main className="bg-[#f5f1e6] min-h-screen">
      <HeroSlider />
      <UgcSection />
      <BlogsCarousel />
    </main>
  );
}