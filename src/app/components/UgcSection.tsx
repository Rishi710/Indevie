"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import { Volume2, VolumeX, Star } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

// ================= TYPES =================
type UgcItem = {
  id: number;
  name: string;
  age: string;
  concern: string;
  quote: string;
  location: string;
  rating: number;
  productLink: string;
  videoSrc: string;
};

// ================= DATA =================
const ugcData: UgcItem[] = [
  {
    id: 1,
    name: "Soumya",
    age: "22",
    concern: "Frizz",
    quote:
      "The wavy routine is a literal game changer – I never even knew my hair had the potential for such defined waves!",
    location: "Delhi",
    rating: 5,
    productLink: "/shop",
    videoSrc:
      "https://cdn.shopify.com/videos/c/o/v/79264dd60dbb47f9abae2dd97c3e6924.mp4",
  },
  {
    id: 2,
    name: "Meera",
    age: "28",
    concern: "Dryness",
    quote:
      "Indévie completely transformed my dry ends. My curls feel hydrated and alive.",
    location: "Mumbai",
    rating: 5,
    productLink: "/shop",
    videoSrc:
      "https://cdn.shopify.com/videos/c/o/v/79264dd60dbb47f9abae2dd97c3e6924.mp4",
  },
  {
    id: 3,
    name: "Ananya",
    age: "25",
    concern: "Dullness",
    quote:
      "The serum gives me a glass-skin glow without being sticky.",
    location: "Bangalore",
    rating: 5,
    productLink: "/shop",
    videoSrc:
      "https://cdn.shopify.com/videos/c/o/v/79264dd60dbb47f9abae2dd97c3e6924.mp4",
  },
];

// Repeat for smooth desktop scroll
const repeatingData: UgcItem[] = [
  ...ugcData,
  ...ugcData.map((d) => ({ ...d, id: d.id + 100 })),
  ...ugcData.map((d) => ({ ...d, id: d.id + 200 })),
];

// ================= CARD =================
const UgcVideoCard = ({
  data,
  isActive,
}: {
  data: UgcItem;
  isActive: boolean;
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

  return (
    <div
      className={`w-[200px] md:w-[260px] lg:w-[300px] shrink-0 transition-all duration-500 ${
        isActive ? "scale-100 opacity-100" : "scale-90 opacity-50"
      }`}
    >
      <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#e8decb]">
        <video
          ref={videoRef}
          src={data.videoSrc}
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
          className="w-full h-full object-cover"
        />

        <button
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            video.muted = !isMuted;
            setIsMuted(!isMuted);
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2 z-10"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
};

// ================= MAIN =================
export default function UgcSection() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // Detect screen size
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ================= SCROLL PHYSICS HOOKS =================
  // React requires all hooks to be unconditionally called BEFORE any early returns!
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    damping: 25,
    stiffness: 120,
  });

  const totalItems = repeatingData.length - 1;

  const x = useTransform(smooth, [0, 1], ["0%", "-80%"]);

  useMotionValueEvent(smooth, "change", (v) => {
    const idx = Math.round(v * totalItems);
    setActiveIndex(idx);
  });

  const activeData = repeatingData[activeIndex] || repeatingData[0];

  const handleMobileScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    let closestIndex = 0;
    let minDistance = Infinity;
    const containerWindowCenter = window.innerWidth / 2;
    
    Array.from(container.children).forEach((child, index) => {
      const childElement = child as HTMLElement;
      const rect = childElement.getBoundingClientRect();
      const childWindowCenter = rect.left + rect.width / 2;
      const distance = Math.abs(containerWindowCenter - childWindowCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (mobileActiveIndex !== closestIndex) {
      setMobileActiveIndex(closestIndex);
    }
  };

  const mobileActiveData = ugcData[mobileActiveIndex] || ugcData[0];

  // ================= MOBILE VIEW =================
  if (isMobile) {
    return (
      <section ref={targetRef} className="py-12 bg-[#f5f1e6] overflow-hidden flex flex-col">
        <h2 className="text-3xl text-center mb-8 text-[#6c3518] italic px-4">
          Voices of Indévie
        </h2>

        {/* Carousel */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 [&::-webkit-scrollbar]:hidden"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            paddingLeft: 'calc(50vw - 100px)',
            paddingRight: 'calc(50vw - 100px)'
          }}
        >
          {ugcData.map((item, idx) => (
             <div key={item.id} className="snap-center shrink-0">
               <UgcVideoCard data={item} isActive={idx === mobileActiveIndex} />
             </div>
          ))}
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-2 mb-8">
          {ugcData.map((_, idx) => (
            <button
               key={idx}
               onClick={() => {
                 if (scrollContainerRef.current) {
                   const container = scrollContainerRef.current;
                   const child = container.children[idx] as HTMLElement;
                   child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                 }
               }}
               aria-label={`Go to slide ${idx + 1}`}
               className={`h-2 rounded-full transition-all duration-300 ${
                 idx === mobileActiveIndex ? "bg-[#6c3518] w-6" : "bg-[#6c3518]/30 w-2"
               }`}
            />
          ))}
        </div>

        {/* Active Content */}
        <div className="px-6 h-[200px]">
          <motion.div
            key={mobileActiveData.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h3 className="text-lg text-[#6c3518] italic mb-4 leading-relaxed min-h-[60px]">
              "{mobileActiveData.quote}"
            </h3>

            <p className="font-bold text-sm text-[#6c3518]">{mobileActiveData.name}</p>
            <p className="text-xs text-[#6c3518]/70 mb-3">
              {mobileActiveData.age} yr • {mobileActiveData.location}
            </p>

            <div className="flex justify-center mb-4 text-[#6c3518]">
              {[...Array(mobileActiveData.rating)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>

            <Link href={mobileActiveData.productLink}>
              <button className="border-b border-[#6c3518] text-sm pb-1 text-[#6c3518] font-medium active:scale-95 transition-transform">
                Discover Routine →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  // ================= DESKTOP VIEW =================
  return (
    <section ref={targetRef} className="relative h-[370vh] bg-[#f5f1e6]">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl text-[#6c3518]">
            Voices of Indévie
          </h2>
          <p className="italic mt-5 text-[#6c3518] tracking-tight">
            Real people, real routines, and moments of care that truly make a difference.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto">

          {/* LEFT CONTENT */}
          <div className="w-full md:w-1/3 px-6 mb-10 md:mb-0">
            <motion.div
              key={activeData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-2xl text-[#6c3518] italic mb-4 leading-relaxed break-words">
                "{activeData.quote}"
              </h3>

              <p className="font-bold text-lg">{activeData.name}</p>
              <p className="text-lg text-gray-500">
                {activeData.age} yr • {activeData.location}
              </p>

              <div className="flex mt-2">
                {[...Array(activeData.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              <Link href={activeData.productLink}>
                <button className="mt-4 border-b border-[#6c3518] text-lg">
                  Discover Routine →
                </button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT SCROLL */}
          <div className="w-full md:w-2/3 overflow-hidden">
            <motion.div style={{ x }} className="flex gap-6 w-max">
              {repeatingData.map((item, idx) => (
                <UgcVideoCard
                  key={`${item.id}-${idx}`}
                  data={item}
                  isActive={idx === activeIndex}
                />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}