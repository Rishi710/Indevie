"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Droplet, HeartHandshake, Leaf, Lightbulb, Recycle, ShieldCheck, Sun, LucideIcon } from "lucide-react";

interface PlaybookItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Add more entries here any time — the card row scrolls, it doesn't wrap.
const PLAYBOOK_ITEMS: PlaybookItem[] = [
  {
    icon: Sun,
    title: "Perfected For Indian Skin",
    description: "Our formulas are intentionally created for Indian skin types, climate, and daily rituals.",
  },
  // {
  //   icon: FlaskConical,
  //   title: "Formulated By Experts",
  //   description: "Every product is developed with inputs from dermatologists and Ayurvedic practitioners.",
  // },
  {
    icon: Lightbulb,
    title: "Genurveda™, Always Evolving",
    description: "Never the same old formula every Indévie product blends ancient ritual with modern science.",
  },
  {
    icon: Leaf,
    title: "Squeaky Clean",
    description: "Vegan and cruelty-free, with none of the ingredients on our clean-beauty blacklist.",
  },
  {
    icon: Droplet,
    title: "Deeply Hydrating Rituals",
    description: "Every formula is crafted to lock in moisture and restore your skin's natural barrier.",
  },
  {
    icon: ShieldCheck,
    title: "Dermatologically Mindful",
    description: "Patch-tested and gentle enough for sensitive, reactive skin.",
  },
  {
    icon: HeartHandshake,
    title: "Community Approved",
    description: "Real rituals, real results loved and reviewed by the Indévie community.",
  },
  {
    icon: Recycle,
    title: "Consciously Packaged",
    description: "Thoughtful packaging designed with sustainability in mind, for a lighter footprint.",
  },
];

export default function ProductPlaybookSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el?.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const doScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // scroll by one card width
    const cardWidth = el.firstElementChild?.clientWidth || 300;
    el.scrollBy({ left: direction === "left" ? -(cardWidth + 12) : cardWidth + 12, behavior: "smooth" });
  };

  return (
    <section className="relative bg-[#B40417] py-8 md:py-8 px-4 sm:px-8 lg:px-56 overflow-hidden">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col items-center text-center mb-8 md:mb-16 gap-3 md:gap-5 mt-4 md:mt-12">
          <h2 className="text-4xl md:text-5xl text-white font-inter uppercase">
            Our <span className="font-semibold italic">
              <span className="absolute inset-x-[-3px] bottom-1 h-3 bg-[#e9c46a]/50 -z-20" />
              Product Playbook</span>
          </h2>

        </div>
        {/* <h2 className="text-center text-2xl sm:text-3xl md:text-5xl font-inter font-light uppercase tracking-wide text-[#f5f1e6] mb-16">
          Our <span className="font-inter font-bold italic text-[#ffffff]">Product Playbook</span>
        </h2> */}

        {/* Outer wrapper — relative so absolute arrows can position against it */}
        <div className="relative">
          {/* Left arrow — tablet & desktop only */}
          <button
            onClick={() => doScroll("left")}
            aria-label="Scroll playbook left"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full border border-[#ffffff] text-[#ffffff] hover:bg-[#f5f1e6]/10 transition-all"
            style={{ opacity: canScrollLeft ? 1 : 0.2, pointerEvents: canScrollLeft ? "auto" : "none" }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Scroll track — flex on ALL sizes (slider everywhere, no grid) */}
          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-5 mb-14 overflow-x-auto overscroll-x-contain snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {PLAYBOOK_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="snap-start shrink-0 border-2 border-[#ffffff] px-4 py-7 flex flex-col items-center text-center w-[65%] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
                >
                  <Icon size={36} strokeWidth={1.25} className="text-[#e3c895] mb-5" />
                  <h3 className="text-lg sm:text-lg/5 font-inter font-semibold uppercase leading-tight text-[#f5f1e6] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] sm:text-sm font-inter font-semibold text-[#ffffff] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right arrow — tablet & desktop only */}
          <button
            onClick={() => doScroll("right")}
            aria-label="Scroll playbook right"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full border border-[#f5f1e6]/25 text-[#f5f1e6] hover:bg-[#f5f1e6]/10 transition-all"
            style={{ opacity: canScrollRight ? 1 : 0.2, pointerEvents: canScrollRight ? "auto" : "none" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
