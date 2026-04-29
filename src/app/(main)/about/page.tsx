"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Volume2, VolumeX, Play } from "lucide-react";

export default function AboutPage() {
  const journeyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start 70%", "end 50%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001
  });

     const [isMuted, setIsMuted] = useState(true);
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
    <main className="relative min-h-screen bg-[#f5f1e6] overflow-x-hidden">
      {/* 🌿 HERO SECTION (Parallax) */}
      <section className="relative h-[95vh] w-full overflow-hidden">
        <div 
          className="fixed inset-0 w-full h-[110vh] z-0 opacity-90"
          style={{
            backgroundImage: "url('https://cdn.shopify.com/s/files/1/0649/7301/3058/files/IMG_2823_JPG.webp?v=1777466926')", 
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#6c3518]/40" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-8xl font-seasons text-white mb-6 drop-shadow-2xl">
              Our Story
            </h1>
            <p className="text-white/90 text-[10px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.6em] font-sans font-light max-w-2xl mx-auto leading-loose">
              Born from care. Backed by science.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🌿 SECTION 1: SO, WHAT IS INDEVIE? (Poster Layout) */}
      <section 
      className="relative z-20 bg-[#f5f1e6] pt-24 md:pt-40 pb-20 px-6 lg:px-12 border-b border-[#6c3518]/10 overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto"

>
          {/* Giant Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full text-left mb-12 md:mb-24"
            style={{
              
              backgroundImage: ``       
             }}
            
          >
             <h2 className="text-[17vw] xs:text-[15vw] sm:text-7xl md:text-[11vw] lg:text-[130px] xl:text-[180px] font-sans font-black text-[#6c3518] leading-[0.9] tracking-[-0.04em] uppercase w-full">
               WHAT IS <br className="lg:hidden"/> INDEVIE?
             </h2>
          </motion.div>

          {/* 3 Column Content Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-16 border-t border-[#6c3518]/20 pt-12 md:pt-16 mt-4 md:mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl md:text-2xl font-sans font-semibold tracking-tight text-[#24120a] mb-3 md:mb-5">Born from care</h3>
              <p className="text-sm md:text-[15px] font-sans text-[#24120a]/80 leading-relaxed font-light">
                Indévie is a new-age Ayurvedic soulcare house backed by science, and inspired by a deeply personal story of helping loved ones heal from within.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h3 className="text-xl md:text-2xl font-sans font-semibold tracking-tight text-[#24120a] mb-3 md:mb-5">Rooted in Genurveda</h3>
              <p className="text-sm md:text-[15px] font-sans text-[#24120a]/80 leading-relaxed font-light">
                Our philosophy beautifully blends generations of traditional wisdom with the absolute clarity, safety, and precision of modern clinical skin science.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-xl md:text-2xl font-sans font-semibold tracking-tight text-[#24120a] mb-3 md:mb-5">Intentional soulcare</h3>
              <p className="text-sm md:text-[15px] font-sans text-[#24120a]/80 leading-relaxed font-light">
                We create gentle, effective formulations designed especially for sensitive, stressed skin and hair—keeping everything clean, minimal, and intentional.
              </p>
            </motion.div>
          </div>

          {/* Bottom CTA Element */}
          <div className="mt-16 md:mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pt-6 border-t border-[#6c3518]/10 md:border-none">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.8, delay: 0.3 }}
             >
               <h3 className="text-2xl md:text-4xl font-sans font-semibold text-[#6c3518] leading-tight max-w-xl">
                 Your routine should feel like ease.<br/>
               </h3>
               <p className="mt-4 font-poppins max-w-3xl text-sm md:text-[15px] text-[#24120a]/80 leading-relaxed font-light">
                Rooted in tradition, but with better boundaries. Familiar, just far more doable. Because self-care shouldn’t feel like a commitment. It should feel like a habit you don’t have to convince yourself to keep.
               </p>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className="w-full md:w-auto mt-4 md:mt-0"
             >
                <Link href="/shop" className="group flex items-center justify-center gap-4 bg-[#6c3518] text-[#f5f1e6] px-10 py-5 rounded-none text-xs uppercase tracking-[0.2em] font-sans font-bold hover:bg-[#d0ba96] hover:text-[#24120a] transition-all w-full md:min-w-[200px]">
                  <span>Explore Collection</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
             </motion.div>
          </div>
        </div>
      </section>

      

      {/* 🌿 SECTION 2: THE JOURNEY (Animated Continuous Timeline) */}
      <section ref={journeyRef} className="relative z-20 bg-[#6c3518] py-32 px-6 lg:px-12 text-[#f5f1e6] overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-center mb-10 md:mb-0 space-y-6"
          >
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-sans font-medium text-[#f5f1e6]/50">
              The Journey
            </h3>
            <h2 className="text-4xl md:text-6xl font-seasons leading-tight md:leading-snug">
              Every challenge shaped <br className="hidden md:block" />
              <span className="italic text-[#f5f1e6]/80" style={{ color: '#d0ba96' }}>what Indevie stands for today.</span>
            </h2>
          </motion.div>

          {/* ----- DESKTOP TIMELINE (Absolute Grid) ----- */}
          <div className="relative w-full max-w-5xl mx-auto min-h-[800px] hidden md:block mt-24">
            {/* The Animated SVG Line exactly linking nodes */}
            <div className="absolute inset-0 z-0 pointer-events-none">
               <svg className="w-full h-full" viewBox="0 0 1000 800" preserveAspectRatio="none">
                 {/* Faded background path */}
                 <path 
                   d="M 800 80 C 800 250, 200 250, 200 400 C 200 550, 600 550, 600 720"
                   fill="none" 
                   stroke="#d0ba96" 
                   strokeOpacity="0.15" 
                   strokeWidth="2" 
                   vectorEffect="non-scaling-stroke" 
                 />
                 {/* Glowing animated path */}
                 <motion.path 
                   d="M 800 80 C 800 250, 200 250, 200 400 C 200 550, 600 550, 600 720"
                   fill="none" 
                   stroke="#d0ba96" 
                   strokeWidth="4" 
                   vectorEffect="non-scaling-stroke" 
                   style={{ pathLength: smoothProgress }}
                   className="drop-shadow-[0_0_12px_rgba(208,186,150,0.8)]"
                 />
               </svg>
            </div>

            {/* Timeline Item 1 - Exactly positioned at (800, 80) which is 10% */}
            <div className="absolute z-10 w-[350px] lg:w-[400px] -translate-y-1/2" style={{ right: '20%', top: '10%' }}>
              <motion.div 
                initial={{ opacity: 0, x: -50, scale: 0.9 }} 
                whileInView={{ opacity: 1, x: 0, scale: 1 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                className="relative flex flex-col items-end w-full"
              >
                <div className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a0e08] border-4 border-[#d0ba96] shadow-[0_0_20px_rgba(208,186,150,0.8)]" />
                <div className="pr-16 text-right w-180">
                  <p className="text-[12px] text-[#d0ba96] uppercase tracking-widest font-sans mb-3 font-semibold">01 &mdash; The Search</p>
                  <p className="text-3xl font-seasons italic mb-4 text-[#f5f1e6]">Patience Required</p>
                  <p className="text-[15px] font-sans text-[#f5f1e6]/80 leading-relaxed font-light">
                    The path to Indevie wasn’t easy. It took working with over ten manufacturers and eight different packaging partners before everything aligned perfectly.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Timeline Item 2 - Exactly positioned at (200, 400) which is 50% */}
            <div className="absolute z-10 w-[350px] lg:w-[400px] -translate-y-1/2" style={{ left: '20%', top: '50%' }}>
              <motion.div 
                initial={{ opacity: 0, x: 50, scale: 0.9 }} 
                whileInView={{ opacity: 1, x: 0, scale: 1 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                className="relative w-full"
              >
                <div className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a0e08] border-4 border-[#d0ba96] shadow-[0_0_20px_rgba(208,186,150,0.8)]" />
                <div className="pl-16 md:pl-24 w-190">
                  <p className="text-[12px] text-[#d0ba96] uppercase tracking-widest font-sans mb-3 font-semibold">02 &mdash; The Intention</p>
                  <p className="text-3xl font-seasons italic mb-4 text-[#f5f1e6]">No Compromises</p>
                  <p className="text-[15px] font-sans text-[#f5f1e6]/80 leading-relaxed font-light">
                    From sourcing the right ingredients to ensuring every formulation followed a clean, no-nonsense approach, we settled for nothing less than perfection.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Timeline Item 3 - Exactly positioned at (600, 720) which is 90% */}
            <div className="absolute z-10 w-[350px] lg:w-[400px] -translate-y-1/2" style={{ right: '40%', top: '90%' }}>
              <motion.div 
                initial={{ opacity: 0, x: -50, scale: 0.9 }} 
                whileInView={{ opacity: 1, x: 0, scale: 1 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                className="relative flex flex-col items-end w-full"
              >
                <div className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a0e08] border-4 border-[#d0ba96] shadow-[0_0_20px_rgba(208,186,150,0.8)]" />
                <div className="pr-16 text-right w-150">
                  <p className="text-[12px] text-[#d0ba96] uppercase tracking-widest font-sans mb-3 font-semibold">03 &mdash; The Reality</p>
                  <p className="text-3xl font-seasons italic mb-4 text-[#f5f1e6]">Worth The Wait</p>
                  <p className="text-[15px] font-sans text-[#f5f1e6]/80 leading-relaxed font-light">
                    Every step required patience, persistence, and intention. Looking back, every challenge beautifully shaped what Indévie stands for today.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ----- MOBILE TIMELINE (Static Linear Fallback) ----- */}
          <div className="relative w-full max-w-[90vw] mx-auto py-10 md:hidden mt-10">
            <motion.div 
              style={{ scaleY: smoothProgress, transformOrigin: 'top' }}
              className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-[#d0ba96]/80 z-0 drop-shadow-[0_0_8px_rgba(208,186,150,0.8)]" 
            />

            {[
              { phase: "01", title: "The Search", desc: "The path to Indévie wasn’t easy. It took working with over ten manufacturers and eight different packaging partners before everything aligned perfectly." },
              { phase: "02", title: "The Intention", desc: "From sourcing the right ingredients to ensuring every formulation followed a clean, no-nonsense approach, we settled for nothing less than perfection." },
              { phase: "03", title: "The Reality", desc: "Every step required patience, persistence, and intention. Looking back, every challenge beautifully shaped what Indévie stands for today." },

            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 20, scale: 0.95 }} 
                whileInView={{ opacity: 1, x: 0, scale: 1 }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20, delay: idx * 0.1 }}
                className="relative flex flex-row items-center justify-between mb-24 group z-10 w-full"
              >
                <div 
                  className="absolute left-[15px] w-4 h-4 rounded-full bg-[#1a0e08] border-4 border-[#d0ba96] -translate-x-1/2 shadow-[0_0_15px_rgba(208,186,150,0.8)]" 
                />
                
                <div className="w-full pl-12">
                  <p className="text-[10px] text-[#d0ba96] uppercase tracking-widest font-sans mb-2 font-semibold">{item.phase} &mdash; {item.title}</p>
                  <p className="text-2xl font-seasons italic mb-3 text-[#f5f1e6]">{item.title}</p>
                  <p className="text-sm font-sans text-[#f5f1e6]/70 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌿 SECTION 3: MORE THAN A BRAND (Family) */}
      <section className="relative z-20 bg-[#f5f1e6] py-32 px-6 lg:px-12 border-t border-[#6c3518]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2 }}
            className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
            onClick={togglePlay}
          >
             {/* <Image 
                src="/images/ig-6.jpg"
                alt="More than a brand, a family"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
             /> */}
              <video
                ref={videoRef}
                src="https://cdn.shopify.com/videos/c/o/v/79264dd60dbb47f9abae2dd97c3e6924.mp4"
                loop
                autoPlay
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
             <div className="absolute inset-0 bg-[#6c3518]/10 transition-colors duration-300 group-hover:bg-[#6c3518]/20 flex items-center justify-center">
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                    <Play size={24} className="ml-1" fill="currentColor" />
                  </div>
                )}
             </div>

             <button 
                onClick={toggleMute}
                className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
             >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="space-y-8"
          >
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-sans font-medium text-[#6c3518]/50">
              More Than A Brand
            </h3>
            <h2 className="text-4xl md:text-5xl font-seasons text-[#6c3518] leading-tight italic">
              Our Indevie Family.
            </h2>
            
            <p className="text-sm md:text-base font-sans text-[#6c3518]/80 leading-relaxed md:leading-loose">
              Along this journey, something unexpected happened. A women-only WhatsApp group turned into a space of support, warmth, and connection. What started as a community slowly began to feel like a family. 
            </p>
            <p className="text-sm md:text-base font-sans text-[#6c3518]/80 leading-relaxed md:leading-loose">
              Every woman became a safe space for another sharing, healing, and uplifting each other without expecting anything in return. Indévie is not just about products. It’s about people.
            </p>

            <div className="pt-4 md:pt-6">
              <a 
                href="https://chat.whatsapp.com/IpBSSA2sron8SdbLwBFhl4?mode=gi_t" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3 bg-[#6c3518] text-white px-8 py-4 rounded-xl text-xs uppercase tracking-[0.2em] font-sans font-bold hover:bg-[#6c3518] transition-all shadow-lg hover:shadow-xl hover:text-[#d0ba96] hover:-translate-y-1 w-full sm:w-max"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                <span>Join Indevie</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🌿 SECTION 4: FOUNDER'S NOTE (Creative Layout) */}
      <section className="relative z-20 bg-[#f5f1e6] py-32 px-6 lg:px-12 overflow-hidden">
        {/* Abstract Background Elements for Creativity */}
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#d0ba96]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#6c3518]/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="flex items-center gap-3 text-[#6c3518]/60">
              <Sparkles size={16} strokeWidth={1.5} />
              <h3 className="text-[11px] uppercase tracking-[0.4em] font-medium font-sans italic">
                Founder&apos;s Note
              </h3>
            </div>
            
            <div className="relative">
              <span className="absolute -top-10 -left-6 text-7xl text-[#6c3518]/10 font-sans font-bold leading-none">"</span>
              <h2 className="text-4xl md:text-[46px] font-seasons text-[#6c3518] leading-[1.3] italic relative z-10 pr-4">
                We wanted to help my mother feel confident.
              </h2>
            </div>
            
            <div className="space-y-6 text-[14px] md:text-[15px] font-sans text-[#6c3518]/70 leading-[1.8] font-light max-w-[480px]">
              <p>
                What started as a quiet thought slowly turned into something much bigger a purpose. I wanted to help my mother feel confident in her skin as she struggled with psoriasis. Watching her go through discomfort, both physically and emotionally, made me realize how deeply personal skincare really is. 
              </p>
              {/* <p>
                What began as small formulations made with care, for one person, gradually grew into something I felt the need to share with many.
              </p> */}
            </div>
            
            <div className="pt-8 border-t border-[#6c3518]/10 w-full max-w-[480px] mt-4">
              <p className="text-xl md:text-2xl font-poppins text-[#6c3518] font-medium">Ar. Ishita Pathak</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6c3518]/50 mt-2 font-medium">Founder, Indévie</p>
            </div>
          </motion.div>

          {/* Right Creative Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="w-full relative flex justify-center lg:justify-end"
          >
            {/* Elegant Solid White Creative Frame imitating screen/card layout */}
            <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-[2.5rem] p-2 bg-white shadow-[0_30px_60px_rgba(108,53,24,0.06)] z-10 transition-transform duration-500 hover:-translate-y-2">
              <div className="relative w-full h-full rounded-[1.8rem] overflow-hidden bg-[#e8decb]">
                <Image 
                  src="/images/founder-indevie.png"
                  alt="Founder of Indévie"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-[2s] ease-out"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* 🌿 CLOSING STATEMENT / CTA */}
      {/* <section className="relative z-20 bg-[#f5f1e6] py-24 px-6 lg:px-12 border-t border-[#6c3518]/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center space-y-10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link 
              href="/shop" 
              className="group flex items-center justify-center gap-3 bg-[#6c3518] text-[#f5f1e6] px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-sans hover:bg-[#5a2c14] transition-all w-full sm:w-auto"
            >
              <span>Explore The Collection</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/contact" 
              className="group flex items-center justify-center gap-3 border border-[#6c3518]/20 bg-transparent text-[#6c3518] px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-sans hover:bg-[#6c3518]/5 transition-all w-full sm:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section> */}
    </main>
  );
}
