"use client";

import { useRef } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/shopify";
import HomeBlogCard from "./HomeBlogCard";
import { motion } from "framer-motion";

interface BlogsCarouselClientProps {
  articles: BlogPost[];
}

export default function BlogsCarouselClient({ articles }: BlogsCarouselClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // We can use a combination of mouse drag and trackpad scrolling, 
  // but a simple scroll snap with a hidden scrollbar works excellent.
  return (
    <section className="py-24 bg-[#f5f1e6] relative text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 gap-5">
           <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-red-800">
             Resources and Insights
           </span>
           <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#6c3518]">
             <span className="font-poppins font-semibold italic">Recent Blogs</span>
        </h2>
        </div>

        {/* Carousel Section */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-5 sm:gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {articles.map((post, index) => (
              <div 
                key={post.id} 
                className="w-[80vw] sm:w-[320px] shrink-0 snap-center sm:snap-start"
              >
                <HomeBlogCard post={post} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="mt-12 flex justify-center">
           <Link 
             href="/blogs"
             className="inline-flex items-center justify-center px-10 py-4 bg-black text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-neutral-900 transition-colors duration-300"
           >
             View all Insights
           </Link>
        </div>
        
      </div>
    </section>
  );
}
