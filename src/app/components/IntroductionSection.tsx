"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function IntroductionSection() {
  return (
    <section 
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
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
  );
}
