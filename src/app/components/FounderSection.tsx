"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

export default function FounderSection() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative py-18 md:py-20 bg-[#6c3518] ml-6 mr-6 rounded-4xl overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#ffffff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#ffffff]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Visual Side (LHS) */}
          <div className="lg:col-span-6 relative group">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] md:aspect-square lg:aspect-[3/4] rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(108,53,24,0.2)] bg-[#ffffff]/10 cursor-pointer"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src="https://cdn.shopify.com/videos/c/o/v/79264dd60dbb47f9abae2dd97c3e6924.mp4"
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Central Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity z-10">
                  <div className="w-14 h-14 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="text-[#6c3518] ml-1.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Mute/Unmute Toggle Overlay */}
              <button 
                onClick={toggleMute}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 text-[#6c3518]"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              {/* Glass Card Annotation (Creative Touch) */}
              <div className="absolute bottom-6 left-6 right-6 p-4 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 hidden md:block opacity-0 translate-y-4 transition-all duration-700 group-hover:opacity-100 group-hover:translate-y-0">
                <p className="text-white text-[10px] uppercase tracking-[0.3em] font-medium font-poppins">A Journey of Intention — Ar. Ishita Pathak</p>
              </div>
            </motion.div>
            
            {/* Border Accents */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#6c3518]/20 rounded-tl-3xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[#6c3518]/20 rounded-br-3xl -z-10" />
          </div>

          {/* Content Side (RHS) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[11px] font-poppins font-bold tracking-[0.5em] uppercase text-[#ffffff]/40 block italic">
                  From Our Founder
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-seasons leading-[1.1] text-[#ffffff] tracking-tight">
                  Built with <span className="italic">intention</span>. <br />
                  Backed by <span className="relative">
                    conviction
                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-[#6c3518]/10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>.
                </h2>
              </div>

              <div className="space-y-6 text-base md:text-lg text-[#ffffff]/70 leading-relaxed font-poppins font-light max-w-xl">
                <p>
                  At Indevie, we set out to create skincare that doesn&apos;t compromise on science, on results, or on integrity.
                </p>
                <p>
                  What started as a personal quest for pure, effective rituals is now a collective mission: to raise the bar for modern botanical beauty, rooted in ancient <strong className="text-[#ffffff]/90 font-medium">Genurveda™</strong> wisdom.
                </p>
                <p className="italic font-serif text-[#ffffff]/50 text-xl md:text-3xl pt-2">
                  &quot;Self-care is the ultimate act of grounding.&quot;
                </p>
              </div>

              <div className="pt-8 flex items-center gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-lg md:text-xl font-poppins font-semibold text-[#ffffff]">
                      Ar. Ishita Pathak
                    </p>
                    <p className="text-[10px] md:text-xs font-poppins font-bold tracking-[0.2em] uppercase text-[#ffffff]/40">
                      Founder, Indevie Beauty
                    </p>
                  </div>
                  
                  {/* Founder Socials */}
                  <div className="flex gap-4 items-center pt-2">
                    <Link href="https://www.instagram.com/indeviebeauty/" className="text-[#ffffff]/40 hover:text-[#ffffff] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </Link>
                    <Link href="https://www.reddit.com/user/IndevieBeauty/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button" className="text-[#ffffff]/40 hover:text-[#ffffff] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M17 11.5a4.5 4.5 0 0 0-9 0"></path><path d="M12 11.5v4"></path><path d="M9 14h6"></path><circle cx="8.5" cy="8.5" r=".5" fill="currentColor"></circle><circle cx="15.5" cy="8.5" r=".5" fill="currentColor"></circle></svg>
                    </Link>
                    <Link href="#" className="text-[#ffffff]/40 hover:text-[#ffffff] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </Link>
                  </div>
                </div>
                {/* Visual signature separator */}
                <div className="w-12 h-[1px] bg-[#ffffff]/20" />
              </div>

              <div className="pt-4">
                <Link href="/about">
                  <button className="text-[11px] font-poppins font-bold tracking-[0.3em] uppercase text-[#ffffff] border-b border-[#ffffff]/30 pb-2 hover:border-[#ffffff] transition-colors">
                    Discover More
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
