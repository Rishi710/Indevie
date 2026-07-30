"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Droplet, FlaskConical, HeartHandshake, Leaf, Lightbulb, Recycle, ShieldCheck, Sun, LucideIcon } from "lucide-react";

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
    description: "Real rituals, real results — loved and reviewed by the Indévie community.",
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
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="relative bg-[#241206] py-16 md:py-20 px-4 sm:px-8 lg:px-16 overflow-hidden pl-10">
      <div className="max-w-[1500px] mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-5xl font-inter font-light uppercase tracking-wide text-[#f5f1e6] mb-10 md:mb-14">
          Our <span className="font-inter font-bold italic text-[#e3c895]">Product Playbook</span>
        </h2>

        <div className="relative flex items-center">
          {/* Left arrow — visible on all screen sizes, hidden when already at the start */}
          <button
            onClick={() => scrollBy(-320)}
            aria-label="Scroll playbook left"
            className={`flex shrink-0 w-9 h-9 sm:w-10 sm:h-10 mr-2 sm:mr-4 items-center justify-center rounded-full border border-[#f5f1e6]/25 text-[#f5f1e6] transition-opacity hover:bg-[#f5f1e6]/10 ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex-1 min-w-0 flex gap-4 md:gap-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-1 py-1"
          >
            {PLAYBOOK_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="snap-center shrink-0 w-[78%] sm:w-[46%] lg:w-[23%] border border-[#f5f1e6]/25 rounded-xl px-6 py-8 flex flex-col items-center text-center"
                >
                  <Icon size={40} strokeWidth={1.25} className="text-[#e3c895] mb-5" />
                  <h3 className="text-sm sm:text-base font-inter font-bold uppercase tracking-wide text-[#f5f1e6] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-inter text-[#f5f1e6]/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right arrow — visible on all screen sizes, hidden when already at the end */}
          <button
            onClick={() => scrollBy(320)}
            aria-label="Scroll playbook right"
            className={`flex shrink-0 w-9 h-9 sm:w-10 sm:h-10 ml-2 sm:ml-4 items-center justify-center rounded-full border border-[#f5f1e6]/25 text-[#f5f1e6] transition-opacity hover:bg-[#f5f1e6]/10 ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
