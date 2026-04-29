"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCollections, fetchCollectionProducts, ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/app/components/ProductCard";
import Link from "next/link";

export default function ShopPage() {
  const [collections, setCollections] = useState<{ title: string; heading: string; products: ShopifyProduct[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCollectionsData = async () => {
      try {
        const allCollections = await fetchCollections();
        
        const fullBodyCol = allCollections.find(c => c.title.toLowerCase().includes("full body") || c.title.toLowerCase().includes("power devi"));
        const minisCol = allCollections.find(c => c.title.toLowerCase().includes("minis") || c.title.toLowerCase().includes("mini"));
        const giftCol = allCollections.find(c => c.title.toLowerCase().includes("share") || c.title.toLowerCase().includes("gift") || c.title.toLowerCase().includes("bundle"));
        const singleCol = allCollections.find(c => c.title.toLowerCase().includes("single"));

        const collectionsToRender = [];

        if (singleCol) {
          const data = await fetchCollectionProducts(singleCol.handle);
          if (data && data.products.length > 0) {
            collectionsToRender.push({
              title: singleCol.title,
              heading: "Full Body’ Power Devi Range",
              products: data.products
            });
          }
        }

        // if (fullBodyCol) {
        //   const data = await fetchCollectionProducts(fullBodyCol.handle);
        //   if (data && data.products.length > 0) {
        //     collectionsToRender.push({
        //       title: fullBodyCol.title,
        //       heading: "‘Full Body’ Power Devi Range",
        //       products: data.products
        //     });
        //   }
        // }

        if (minisCol) {
          const data = await fetchCollectionProducts(minisCol.handle);
          if (data && data.products.length > 0) {
            collectionsToRender.push({
              title: minisCol.title,
              heading: "Power Devi ‘MINIS’ Range",
              products: data.products
            });
          }
        }

        if (giftCol) {
          const data = await fetchCollectionProducts(giftCol.handle);
          if (data && data.products.length > 0) {
            collectionsToRender.push({
              title: giftCol.title,
              heading: "Share the Devi Energy (Gifting Bundles)",
              products: data.products
            });
          }
        }

        // Fallback: If no matching collections found, just show all non-empty collections
        if (collectionsToRender.length === 0 && allCollections.length > 0) {
           for (const col of allCollections) {
              const data = await fetchCollectionProducts(col.handle);
              if (data && data.products.length > 0 && col.handle !== 'frontpage') {
                 collectionsToRender.push({
                    title: col.title,
                    heading: col.title, // Use original title as fallback
                    products: data.products
                 });
              }
           }
        }

        setCollections(collectionsToRender);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    getCollectionsData();
  }, []);

  return (
    <main className="relative min-h-screen bg-[#f5f1e6] overflow-x-hidden">
      {/* 🌿 PARALLAX HERO SECTION (Modeled after Contact Page) */}
      <section className="relative h-[80vh] md:h-[100vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-[100vh] md:h-[100vh] z-0 opacity-100"
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
      <section className="relative z-20 bg-[#f5f1e6] pt-20 ">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16">
          
          {loading ? (
            <div className="space-y-32">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-12 animate-pulse" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="animate-pulse space-y-4">
                        <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : collections && collections.length > 0 ? (
            <div className="space-y-12">
              {collections.map((collection, colIndex) => (
                <div key={colIndex}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-8 pb-6 border-b border-[#6c3518]/10">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#6c3518]/40 italic">Collection</span> */}
                      <h2 className="text-3xl md:text-4xl font-poppins font-bold text-center text-[#6c3518]">{collection.heading}</h2>
                      {/* <span className="px-3 py-1 bg-[#6c3518]/5 rounded-full text-[10px] font-bold text-[#6c3518]/60 uppercase tracking-widest">
                        {collection.products.length} Items
                      </span> */} 
                    </div>
                  </div>
                  
                  <div 
                    className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-y-10 gap-x-4 md:gap-x-5 px-4 md:px-10 -mx-4 md:mx-0 pb-2 [&::-webkit-scrollbar]:hidden" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {collection.products.map((product, index) => (
                      <motion.div 
                        key={product.id} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="min-w-[85vw] sm:min-w-[45vw] snap-center shrink-0 md:min-w-0 md:shrink md:snap-align-none"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
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
