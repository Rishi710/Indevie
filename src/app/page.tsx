export const dynamic = "force-dynamic";
import Image from "next/image";

import HeroSlider from "./components/HeroSlider";
import InfiniteTicker from "./components/InfiniteTicker";
import IntroductionSection from "./components/IntroductionSection";
import UgcSection from "./components/UgcSection";
import HomeTestimonials from "./components/HomeTestimonials";
import FounderSection from "./components/FounderSection";
import BlogsCarousel from "./components/BlogsCarousel";
import InstagramSection from "./components/InstagramSection";
import ProductGridSection from "./components/ProductGridSection";
import BrandMantra from "./components/BrandMantra";
import ShopBanner from "./components/ShopBanner";

export default function Home() {
  return (
    <main className="bg-[#f5f1e6] min-h-screen">
      <HeroSlider />
      <InfiniteTicker />
      <BrandMantra />
      <ProductGridSection />
      <ShopBanner />
      <IntroductionSection />
      <UgcSection />
      <HomeTestimonials />
      <FounderSection />
      <BlogsCarousel />
      <InstagramSection />
    </main>
  );
}