"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BlogPost } from "@/lib/shopify";

interface HomeBlogCardProps {
  post: BlogPost;
  index: number;
}

export default function HomeBlogCard({ post, index }: HomeBlogCardProps) {
  // Format the date to match the uppercase format in the image, e.g., "MARCH 26, 2025"
  const formattedDate = new Date(post.publishedAt)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer flex flex-col gap-4"
    >
      <Link href={`/blogs/${post.handle}`} className="outline-none block w-full">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-100 rounded-[32px]">
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.altText || post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
               No Image
            </div>
          )}
        </div>
        
        <div className="flex flex-col mt-5 space-y-3 px-1">
          <h3 className="text-xl md:text-2xl font-serif text-gray-900 leading-tight group-hover:text-red-900 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500">
            {formattedDate}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
