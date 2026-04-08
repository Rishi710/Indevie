"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { ShopifyProduct } from "@/lib/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: "smooth"
      });
    }
  };

  const price = product?.variants?.nodes[0]?.price;
  const images = product?.images?.nodes || [];

  // Format to match screenshot: "RS. 17,000"
  const formattedPrice = price 
    ? `RS. ${parseFloat(price.amount).toLocaleString("en-IN")}` 
    : "N/A";

  return (
    <Link href={`/products/${product.handle}`} className="flex flex-col group cursor-pointer hover:border-1 border-black p-1.5 rounded-[10px] bg-#6c3518">
      {/* Image Container */}
      <div className="group/image relative w-full aspect-[4/5] rounded-[10px] overflow-hidden bg-[#e5e5e5] mb-4">
         {/* Bookmark Icon */}
         {/* <button 
           className="absolute top-4 right-4 z-10 text-black hover:scale-110 transition-transform drop-shadow-md"
           onClick={(e) => {
             e.preventDefault();
             // Add to wishlist logic
           }}
         >
           <Bookmark size={22} strokeWidth={0} fill="currentColor" />
         </button> */}

         {/* Image Slider */}
         {images.length > 0 ? (
           <div 
             ref={scrollRef}
             className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             onScroll={(e) => {
                const target = e.currentTarget;
                const idx = Math.round(target.scrollLeft / target.clientWidth);
                if (idx !== currentImageIndex) setCurrentImageIndex(idx);
             }}
           >
             {images.slice(0, 5).map((img, idx) => (
               <div key={idx} className="relative min-w-full h-full snap-center shrink-0">
                 <Image
                   src={img?.url}
                   alt={img?.altText || product.title}
                   fill
                   className="object-cover transition-transform duration-500 group-hover/image:scale-[1.03]"
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                 />
               </div>
             ))}
           </div>
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-[#d3d3d3]">
             <span className="text-gray-500 text-sm">No Image</span>
           </div>
         )}

         {/* Hover Arrows (Desktop) */}
         {images.length > 1 && (
           <>
             <button
               onClick={(e) => {
                 e.preventDefault();
                 setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                 scrollToImage(currentImageIndex === 0 ? (Math.min(images.length, 5) - 1) : currentImageIndex - 1);
               }}
               className="hidden md:flex absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-white/60 text-black opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 hover:bg-white z-10 shadow-sm"
             >
               <ArrowLeft size={20} strokeWidth={1.5} />
             </button>
             <button
               onClick={(e) => {
                 e.preventDefault();
                 setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                 scrollToImage(currentImageIndex === (Math.min(images.length, 5) - 1) ? 0 : currentImageIndex + 1);
               }}
               className="hidden md:flex absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-white/60 text-black opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 hover:bg-white z-10 shadow-sm"
             >
               <ArrowRight size={20} strokeWidth={1.5} />
             </button>
           </>
         )}

         {/* Pagination Dots */}
         {images.length > 1 && (
           <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-1.5 z-10">
             {images.slice(0, 5).map((_, idx) => (
               <button
                 key={idx}
                 onClick={(e) => {
                   e.preventDefault();
                   scrollToImage(idx);
                 }}
                 className={`rounded-full transition-all duration-300 shadow-sm ${
                   idx === currentImageIndex 
                     ? "bg-white w-1.5 h-1.5" 
                     : "bg-white/50 w-1 h-1 hover:bg-white/80"
                 }`}
               />
             ))}
           </div>
         )}
      </div>

      {/* Info Container */}
      <div className="flex flex-col px-1 mt-1">
        <div className="flex flex-col gap-0.5 mb-3">
          <h3 className="text-[13px] font-medium text-[#2a2a2a] leading-tight">
            {product.title}
          </h3>
          <p className="text-[12px] text-[#555] tracking-wide">
             {formattedPrice}
          </p>
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            // TODO: integrate actual cart context
            alert(`Added ${product.title} to cart`);
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#6c3518] border rounded-[10px] border-[#e5e5e5] text-white py-3 mb-2 hover:bg-white hover:border-black hover:text-[#6b3517] transition-colors"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase">Add to cart</span>
        </button>
      </div>
    </Link>
  );
}
