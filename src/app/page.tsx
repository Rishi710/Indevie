export const revalidate = 3600; // Revalidate every hour
import dynamic from "next/dynamic";

import HeroSlider from "./components/HeroSlider";
import InfiniteTicker from "./components/InfiniteTicker";
import BrandMantra from "./components/BrandMantra";
import ProductGridSection from "./components/ProductGridSection";

// Dynamic imports for components below the fold
const ShopBanner = dynamic(() => import("./components/ShopBanner"));
const IntroductionSection = dynamic(() => import("./components/IntroductionSection"));
const UgcSection = dynamic(() => import("./components/UgcSection"));
const HomeTestimonials = dynamic(() => import("./components/HomeTestimonials"));
const FounderSection = dynamic(() => import("./components/FounderSection"));
const BlogsCarousel = dynamic(() => import("./components/BlogsCarousel"));
const InstagramSection = dynamic(() => import("./components/InstagramSection"));

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