"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BlogPost } from "@/lib/shopify";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <Link href={`/blogs/${post.handle}`}>
        <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-gray-100 rounded-sm">
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.altText || post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
               No Image
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-red-800">Journal</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500">{formattedDate}</span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-serif text-gray-900 leading-tight group-hover:text-red-900 transition-colors">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-light">
              {post.excerpt}
            </p>
          )}
          
          <div className="pt-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-gray-900 border-b border-gray-900/10 group-hover:border-red-900 transition-all">
              Read More
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
