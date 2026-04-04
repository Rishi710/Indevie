"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BlogPost } from "@/lib/shopify";
import { Share2 } from "lucide-react";
import dynamic from "next/dynamic";

// Import the entire shader background as a single client-only chunk
// This prevents Next.js SSR hydration mismatches and React Three Fiber context errors
const ShaderBackground = dynamic(
  () => import("./ShaderBackground"),
  { ssr: false }
);

interface BlogHeroProps {
  post: BlogPost;
}

export default function BlogHero({ post }: BlogHeroProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden z-0">
      {/* Dynamic Background */}
      {/* <ShaderBackground /> */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href={`/blogs/${post.handle}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-1 relative aspect-[16/10] overflow-hidden rounded-sm bg-gray-100"
          >
            {post.image ? (
              <Image
                src={post.image.url}
                alt={post.image.altText || post.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-2 space-y-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#c93e3e]">Featured Article</span>
              <span className="w-10 h-[1px] bg-[#c93e3e]/40"></span>
            </div>
            
            <h1 className="text-4xl md:text-4xl lg:text-4xl font-poppins text-gray-900 leading-[1.1] group-hover:text-red-900 transition-colors">
              {post.title}
            </h1>
            
            <p className="text-2sm text-gray-900 leading-relaxed font-light max-w-xl">
              {post.excerpt || "Explore the latest insights and rituals from Indevie Beauty. A journey into sustainable skincare and mindful living."}
            </p>
            
            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-2">Date</span>
                <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
              </div>
              
              <div className="w-[1px] h-10 bg-gray-200"></div>
              
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-2">Author</span>
                <span className="text-sm font-medium text-gray-900">{post.authorV2?.name || "Indevie Editor"}</span>
              </div>
              
              <div className="ml-0 md:ml-4 mt-2 md:mt-0 flex items-center gap-4">
                 <button className="px-10 py-4 bg-black text-white text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#c93e3e] transition-colors duration-300 rounded-none w-auto">
                   Read Article
                 </button>
                 <button 
                   onClick={(e) => {
                     e.preventDefault();
                     if (navigator.share) {
                       navigator.share({
                         title: post.title,
                         url: window.location.origin + `/blogs/${post.handle}`
                       }).catch(() => {});
                     }
                   }}
                   className="p-[14px] border border-gray-200 text-gray-400 hover:text-black hover:border-black transition-colors rounded-none bg-white"
                   aria-label="Share article"
                 >
                   <Share2 size={16} />
                 </button>
              </div>
            </div>
          </motion.div>
          
        </Link>
      </div>
    </section>
  );
}
