"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { ShopifyProduct } from "@/lib/shopify";

interface ProductSliderProps {
  products: ShopifyProduct[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    // Scroll by exactly one card width (half the container width on mobile)
    const scrollAmount = el.clientWidth / 2 + 6;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full px-4 sm:px-8 lg:px-16">
      {/* Left Arrow - visible at every breakpoint so desktop/tablet can also
          scroll to see every product in the collection, not just the first
          screenful. */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Previous product"
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center shadow-md transition-opacity"
        style={{ opacity: canScrollLeft ? 1 : 0.3, pointerEvents: canScrollLeft ? "auto" : "none" }}
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      {/* Right Arrow - visible at every breakpoint, see above. */}
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Next product"
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/90 text-white flex items-center justify-center shadow-md transition-opacity"
        style={{ opacity: canScrollRight ? 1 : 0.3, pointerEvents: canScrollRight ? "auto" : "none" }}
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/*
        Mobile: horizontal flex slider showing 2 cards + peek of 3rd (unchanged).
        Desktop/tablet (md+): also a horizontal scroll slider -- 4 cards exact-fit
        on md, 5 on lg -- so every product in the collection is reachable via the
        arrows above instead of being capped to the first screenful.
      */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={[
              // Mobile: each card takes ~48% of container so 2 fit with a gap + slight peek
              "shrink-0 snap-start",
              "w-[calc(50%-6px)] min-w-0",
              // Desktop/tablet: exact-fit widths so N cards fill the row with no partial peek
              "md:w-[calc((100%-4.5rem)/4)]",
              "lg:w-[calc((100%-6rem)/5)]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <ProductCard product={product} priority={idx === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
