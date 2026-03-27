"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BlogPost } from "@/lib/shopify";

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
    <section className="relative w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-red-800">Featured Article</span>
              <span className="w-8 h-[1px] bg-red-800/20"></span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-[1.1] group-hover:text-red-900 transition-colors">
              {post.title}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed font-light max-w-xl">
              {post.excerpt || "Explore the latest insights and rituals from Indevie Beauty. A journey into sustainable skincare and mindful living."}
            </p>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Date</span>
                <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
              </div>
              
              <div className="w-[1px] h-8 bg-gray-100"></div>
              
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Author</span>
                <span className="text-sm font-medium text-gray-900">{post.authorV2?.name || "Indevie Editor"}</span>
              </div>
            </div>
            
            <div className="pt-8">
               <button className="px-10 py-4 bg-black text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-red-950 transition-colors rounded-none">
                 Read Article
               </button>
            </div>
          </motion.div>
          
        </Link>
      </div>
    </section>
  );
}
