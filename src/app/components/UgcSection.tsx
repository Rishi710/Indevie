"use client";

import { Volume2, VolumeX, ArrowUpRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ================= TYPES =================
// Unchanged — every field below is still part of the data model and still used.
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

// ================= DATA ================= (unchanged)
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
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  const productImageUrl = product?.images?.nodes?.[0]?.url;
  const productPrice = product?.variants?.nodes?.[0]?.price?.amount;
  const productCompareAtPrice = product?.variants?.nodes?.[0]?.compareAtPrice?.amount;

  return (
    <div className="relative w-[220px] sm:w-[260px] md:w-[290px] lg:w-[320px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden bg-[#e8decb]">
      {/* Video */}
      <video
        ref={videoRef}
        src={data.videoSrc}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Mute button — white circle, top-right */}
      <button
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          video.muted = !isMuted;
          setIsMuted(!isMuted);
        }}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white text-black rounded-full p-1.5 sm:p-2 z-10 shadow-sm hover:scale-105 transition-transform"
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </button>

      {/* Quote overlay — back at the top so it never competes with the
          product box below. line-clamp keeps its height fixed regardless
          of quote length, so longer testimonials never crowd the video. */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute top-4 sm:top-6 left-3 sm:left-5 right-11 sm:right-14">
        <p className="text-white font-poppins font-semibold text-[12px] sm:text-[15px] drop-shadow-md leading-snug line-clamp-3">
          "{data.quote}"
        </p>
        <p className="text-white/90 text-[10px] sm:text-xs mt-1 sm:mt-2 drop-shadow-md font-medium truncate">
          — {data.name}, {data.age} · {data.location}
        </p>
      </div>

      {/* Bottom gradient for the product overlay */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Product overlay — restored from the old design, sized responsively */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
          {productImageUrl ? (
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[#f5f1e6] shrink-0">
              <Image src={productImageUrl} alt={product?.title || "Product"} fill className="object-cover" sizes="48px" />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#e8decb] shrink-0 animate-pulse" />
          )}
          <div className="flex flex-col min-w-0 pr-1 sm:pr-2">
            <span className="text-[9px] sm:text-[11px] font-poppins font-bold text-amber-500 tracking-wide">★★★★★</span>
            <span className="text-xs sm:text-sm font-poppins font-semibold text-[#1a1a1a] truncate leading-tight">
              {product?.title || "Indevie Product"}
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {productPrice && (
                <span className="text-[10px] sm:text-[11px] text-[#1a1a1a] font-bold font-poppins">
                  ₹{Math.round(productPrice)}
                </span>
              )}
              {productCompareAtPrice && parseFloat(productCompareAtPrice) > parseFloat(productPrice || "0") && (
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium font-poppins line-through">
                  ₹{Math.round(parseFloat(productCompareAtPrice))}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={`/products/${data.productHandle}`}
          aria-label="Shop this product"
          className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center shrink-0 hover:scale-105 hover:bg-black transition-all"
        >
          <ArrowUpRight className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
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
    initialProducts.forEach((p) => (map[p.handle] = p));
    return map;
  });

  useEffect(() => {
    if (initialProducts.length > 0) return;
    import("../../lib/shopify").then(({ fetchProducts }) => {
      fetchProducts(20)
        .then((products) => {
          const map: Record<string, any> = {};
          products.forEach((p) => (map[p.handle] = p));
          setProductsMap(map);
        })
        .catch(console.error);
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
      const rect = (child as HTMLElement).getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (activeIndex !== closestIndex) {
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

      {/* Carousel — flush against the left edge, no centering spacers, no dot indicators */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-start overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-2 md:gap-2 lg:gap-2  mx-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {ugcData.map((item, idx) => (
          <div key={item.id} className="snap-start shrink-0">
            <UgcVideoCard
              data={item}
              isActive={idx === activeIndex}
              product={productsMap[item.productHandle]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
