"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ================= TYPES =================
type UgcItem = {
  id: number;
  name: string;
  age: string;
  quote: string;
  location: string;
  rating: number;
  productHandle: string;
  videoSrc: string;
};

// ================= DATA =================
const ugcData: UgcItem[] = [
  {
    id: 1,
    name: "Tanu chokarika",
    age: "25",
    quote: "A non-sticky glow? Smells so good too.",
    location: "Bangalore",
    rating: 5,
    productHandle: "indevie-glow-maalish-oil",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/8d0383e1b28946ee85ef87915691b5aa.mp4",
  },
  {
    id: 2,
    name: "Kanika Maghav",
    age: "25",
    quote: "I had such a bad headache and in just 15 seconds, it blew like a wind.",
    location: "Bangalore",
    rating: 5,
    productHandle: "indevie-calm-balm",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/623d09ce1d884c168fc086f4c203a4cc.mp4",
  },
  {
    id: 3,
    name: "Sata Deekshitha",
    age: "25",
    quote: "Glow Maalish, my go to for every skin problem",
    location: "Bangalore",
    rating: 5,
    productHandle: "indevie-glow-maalish-oil",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/a8f1a2e826d44fcd8f6f487e9d84e733.mp4",
  },
  {
    id: 4,
    name: "Ishita phatak",
    age: "30",
    quote: "Indevie is supposed to make you remember who you are truly. Channel your inner devi and never stop taking care of yourself.",
    location: "Indore",
    rating: 5,
    productHandle: "indevie-calm-balm",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/f877e19335cd40bb96cbb8a860f17d07.mp4",
  },
  {
    id: 5,
    name: "Shweta Patil",
    age: "28",
    quote: "I was going to get merried in 7 days and this body oil helped me recover my glow in just 3 days.",
    location: "Alibag",
    rating: 5,
    productHandle: "indevie-glow-maalish-oil",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/2325f46207224f8a92d0010acbe46afd.mp4",
  },
  {
    id: 6,
    name: "Sazleen kaur",
    age: "28",
    quote: "Being a new mother, baby duties has made my life chaotic. The calm balm is my escape to every problem now.",
    location: "Delhi",
    rating: 5,
    productHandle: "the-ultimate-care-ritual-set",
    videoSrc: "https://cdn.shopify.com/videos/c/o/v/ea819fb229354eb19ee28cb6c9d732dc.mp4",
  },
];

// ================= CARD =================
const UgcVideoCard = ({
  data,
  isActive,
  product,
}: {
  data: UgcItem;
  isActive: boolean;
  product: any;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  const productImageUrl = product?.images?.nodes?.[0]?.url;
  const productPrice = product?.variants?.nodes?.[0]?.price?.amount;
  const productCompareAtPrice = product?.variants?.nodes?.[0]?.compareAtPrice?.amount;

  return (
    <div
      className={`relative w-[280px] md:w-[320px] aspect-[9/16] shrink-0 transition-all duration-500 rounded-[2rem] overflow-hidden bg-[#e8decb] shadow-lg ${
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-60"
      }`}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={data.videoSrc}
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Quote Overlay */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute top-6 left-5 right-16">
        <p className="text-white font-poppins font-semibold text-[15px] drop-shadow-md leading-snug">
          "{data.quote}"
        </p>
        <p className="text-white/90 text-xs mt-2 drop-shadow-md font-medium">
          — {data.name}
        </p>
      </div>

      {/* Mute Button */}
      <button
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          video.muted = !isMuted;
          setIsMuted(!isMuted);
        }}
        className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white rounded-full p-2.5 z-10 hover:bg-black/40 transition-colors"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Bottom Gradient for Product Overlay */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Product Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3 overflow-hidden">
          {productImageUrl ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#f5f1e6] shrink-0">
              <Image src={productImageUrl} alt={product?.title || "Product"} fill className="object-cover" />
            </div>
          ) : (
             <div className="w-12 h-12 rounded-xl bg-[#e8decb] shrink-0 animate-pulse" />
          )}
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[11px] font-poppins font-bold text-amber-500 tracking-wide">★★★★★</span>
            <span className="text-sm font-poppins font-semibold text-[#1a1a1a] truncate leading-tight">{product?.title || "Indevie Product"}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {productPrice && (
                <span className="text-[11px] text-[#1a1a1a] font-bold font-poppins">₹{Math.round(productPrice)}</span>
              )}
              {productCompareAtPrice && parseFloat(productCompareAtPrice) > parseFloat(productPrice || "0") && (
                <span className="text-[10px] text-gray-400 font-medium font-poppins line-through">₹{Math.round(parseFloat(productCompareAtPrice))}</span>
              )}
            </div>
          </div>
        </div>
        
        <Link 
          href={`/products/${data.productHandle}`}
          className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center shrink-0 hover:scale-105 hover:bg-black transition-all"
        >
          <ArrowUpRight size={18} className="text-white" />
        </Link>
      </div>
    </div>
  );
};

interface UgcSectionProps {
  initialProducts?: any[];
}

// ================= MAIN =================
export default function UgcSection({ initialProducts = [] }: UgcSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [productsMap, setProductsMap] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    initialProducts.forEach(p => map[p.handle] = p);
    return map;
  });

  useEffect(() => {
    if (initialProducts.length > 0) return;
    import("../../lib/shopify").then(({ fetchProducts }) => {
      fetchProducts(20).then((products) => {
        const map: Record<string, any> = {};
        products.forEach(p => map[p.handle] = p);
        setProductsMap(map);
      }).catch(console.error);
    });
  }, [initialProducts]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    let closestIndex = 0;
    let minDistance = Infinity;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    
    Array.from(container.children).forEach((child, index) => {
      // Skip spacer divs
      if (index === 0 || index === container.children.length - 1) return;
      
      const childElement = child as HTMLElement;
      const rect = childElement.getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index - 1; // Adjust for the first spacer div
      }
    });

    if (activeIndex !== closestIndex && closestIndex >= 0 && closestIndex < ugcData.length) {
      setActiveIndex(closestIndex);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#f5f1e6] flex flex-col justify-center overflow-hidden">
      {/* Heading */}
      <div className="flex flex-col items-center text-center mb-10 gap-4 px-6">
         <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold text-red-800">
          Hear it from our
         </span>
         <h2 className="text-4xl md:text-5xl text-[#6c3518] font-serif font-bold">
          Power Devi's
        </h2>
         <p className="italic text-[#6c3518] tracking-tight text-lg md:text-xl max-w-xl">
          Real people, real routines, and moments of care that truly make a difference.
        </p>
      </div>

      {/* Carousel */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-center overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 pt-4 px-4 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="shrink-0 w-[calc(50vw-140px-1rem)] md:w-[calc(50vw-160px-1rem)]" />
        
        {ugcData.map((item, idx) => (
          <div key={item.id} className="snap-center shrink-0">
            <UgcVideoCard
              data={item}
              isActive={idx === activeIndex}
              product={productsMap[item.productHandle]}
            />
          </div>
        ))}
        
        <div className="shrink-0 w-[calc(50vw-140px-1rem)] md:w-[calc(50vw-160px-1rem)]" />
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-2">
        {ugcData.map((_, idx) => (
          <button
             key={idx}
             onClick={() => {
               if (scrollContainerRef.current) {
                 const container = scrollContainerRef.current;
                 // Index + 1 because we have a spacer div at the beginning
                 const child = container.children[idx + 1] as HTMLElement;
                 child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
               }
             }}
             aria-label={`Go to slide ${idx + 1}`}
             className={`h-2 rounded-full transition-all duration-300 ${
               idx === activeIndex ? "bg-[#6c3518] w-8" : "bg-[#6c3518]/30 w-2 hover:bg-[#6c3518]/60"
             }`}
          />
        ))}
      </div>
    </section>
  );
}