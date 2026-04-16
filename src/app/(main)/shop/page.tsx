"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/app/components/ProductCard";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts(50);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  return (
    <main className="relative min-h-screen bg-[#f5f1e6] overflow-x-hidden">
      {/* 🌿 PARALLAX HERO SECTION (Modeled after Contact Page) */}
      <section className="relative h-[80vh] md:h-[100vh] w-full overflow-hidden">
        <div 
          className="fixed inset-0 w-full h-[100vh] md:h-[100vh] z-0 opacity-100"
          style={{
            backgroundImage: "url('/images/DSC_6451.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Soft Overlay for depth */}
          <div className="absolute inset-0 bg-[#6c3518]/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-8xl font-poppins-light italic text-white mb-6 drop-shadow-2xl">
              The Ritual Library
            </h1>
            <p className="text-white/90 text-[10px] md:text-xs uppercase tracking-[0.6em] font-light max-w-lg mx-auto leading-loose drop-shadow-lg">
              Curated botanical treasures for your daily sanctuary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🍶 CONTENT SECTION */}
      <section className="relative z-20 bg-[#f5f1e6] pt-24 pb-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16">
          
          {/* Organization / Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-20 pb-12 border-b border-[#6c3518]/10">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#6c3518]/40 italic">Collection</span>
              <h2 className="text-2xl md:text-3xl font-serif text-[#6c3518]">All Rituals</h2>
              <span className="px-3 py-1 bg-[#6c3518]/5 rounded-full text-[10px] font-bold text-[#6c3518]/60 uppercase tracking-widest">
                {products.length} Items
              </span>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6c3518]/40 transition-colors group-hover:text-[#6c3518]">Sort By</span>
                <div className="flex items-center gap-2 text-[12px] font-medium text-[#6c3518]">
                  <span>Featured</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-20 gap-x-4 md:gap-x-12">
              {products.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40">
              <h2 className="text-2xl font-serif italic text-[#6c3518] mb-4">Our rituals are currently being prepared.</h2>
              <Link href="/" className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#6c3518]/60 hover:text-[#6c3518] border-b border-transparent hover:border-[#6c3518] transition-all pb-1">
                Explore our Story
              </Link>
            </div>
          )}

          {/* Bottom Aesthetic Note */}
          <div className="mt-48 text-center">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="h-[1px] w-24 bg-[#6c3518]/20 mx-auto" />
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#6c3518]/30">
                Ethically Sourced • Botanically Pure • Timeless Wisdom
              </p>
              <div className="text-4xl md:text-6xl font-serif italic text-[#6c3518]/5 select-none pointer-events-none">
                Indevie Beauty
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
