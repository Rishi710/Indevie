"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function IntroductionSection() {
  return (
    <>
      <div className="w-full bg-transparent text-[#6c3518] leading-[0] overflow-hidden -mb-[1px]">
        <svg className="relative block w-full h-[50px] md:h-[50px]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
          <defs>
            <path id="wave-3" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"></path>
          </defs>
          <g className="wave1" opacity="0.2">
            <use href="#wave-3" x="50" y="3" fill="currentColor"></use>
          </g>
          <g className="wave2" opacity="0.4">
            <use href="#wave-3" x="50" y="0" fill="currentColor"></use>
          </g>
          <g className="wave3" opacity="0.6">
            <use href="#wave-3" x="50" y="9" fill="currentColor"></use>
          </g>
          <g className="wave4" opacity="1">
            <use href="#wave-3" x="50" y="6" fill="currentColor"></use>
          </g>
        </svg>
      </div>
      <section 
        className="w-full pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundColor: '#6c3518',
        }}
      >
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Left: Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-auto min-h-[400px] rounded-[10px] md:rounded-[40px] overflow-hidden"
          >
            <Image
              src="/images/intro.PNG"
              alt="Indevie Product Introduction"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* Right: Content Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="bg-white rounded-[10px] md:rounded-[40px] p-8 md:p-12 lg:p-16 flex flex-col justify-center shadow-sm border border-black/5"
          >
            <div className="space-y-6 md:space-y-8">
              <p className="text-[10px] md:text-xs font-poppins font-bold tracking-[0.3em] uppercase text-red-800">
                Introducing Genurveda™
              </p>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-semibold leading-[1.1] text-[#6c3518]">
                Where Ancient Rituals Meet Modern Calm
              </h2>
              
              <div className="space-y-4 text-sm md:text-base text-[#6c3518]/80 leading-relaxed font-poppins">
                <p>
                    Genurveda™ is our new-age interpretation of Ayurveda, designed thoughtfully for this generation.  
                </p>
                <p>
                  It bridges <strong>traditional herbs</strong>, <strong>modern skin science</strong>, and <strong>simple everyday rituals</strong> to create selfcare that feels grounding, effective, and emotionally comforting.</p><p>It’s Ayurveda made easier, gentler, and more intuitive. A philosophy that truly honors our roots while evolving with the needs of the next generation
                </p>
              </div>

              <div className="pt-4">
                <Link href="/about">
                  <button className="bg-[#6c3518] text-[#f5f1e6] px-10 py-4 rounded-[10px] border-1 border-[#6c3518] text-xs md:text-sm font-poppins font-medium tracking-wider hover:bg-white hover:text-[#6c3518] hover:border-[#6c3518] transition-all active:scale-95 shadow-lg">
                    Know More About Us
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
    </>
  );
}
