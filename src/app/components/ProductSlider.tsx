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
      {/* Left Arrow - mobile only */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Previous product"
        className="md:hidden absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center shadow-md transition-opacity"
        style={{ opacity: canScrollLeft ? 1 : 0.3, pointerEvents: canScrollLeft ? "auto" : "none" }}
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      {/* Right Arrow - mobile only */}
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Next product"
        className="md:hidden absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/90 text-white flex items-center justify-center shadow-md transition-opacity"
        style={{ opacity: canScrollRight ? 1 : 0.3, pointerEvents: canScrollRight ? "auto" : "none" }}
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>

      {/* 
        Mobile: horizontal flex slider showing 2 cards + peek of 3rd
        Desktop (md+): standard grid layout 
      */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 md:grid md:grid-cols-4 md:gap-6 md:overflow-x-visible lg:grid-cols-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={[
              // Mobile: each card takes ~48% of container so 2 fit with a gap + slight peek
              "shrink-0 snap-start",
              "w-[calc(50%-6px)] min-w-0",
              // Desktop overrides
              "md:w-auto md:shrink",
              // Hide 5th card on md but show on lg
              idx >= 4 ? "md:hidden lg:block" : "",
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
