export const dynamic = "force-dynamic";
import Image from "next/image";

import HeroSlider from "./components/HeroSlider";
import IntroductionSection from "./components/IntroductionSection";
import UgcSection from "./components/UgcSection";
import HomeTestimonials from "./components/HomeTestimonials";
import BlogsCarousel from "./components/BlogsCarousel";
import InstagramSection from "./components/InstagramSection";
import ProductGridSection from "./components/ProductGridSection";
import ProductCard from "./components/ProductCard";

export default function Home() {
  console.log("STORE:", process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
  return (
    <main className="bg-[#f5f1e6] min-h-screen">
      <HeroSlider />
      <ProductGridSection />
      <IntroductionSection />
      <UgcSection />
      <HomeTestimonials />
      <BlogsCarousel />
      <InstagramSection />
    </main>
  );
}