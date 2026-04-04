"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight
} from "lucide-react";

// --- Magnetic Interaction Wrapper ---
const Magnetic = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const quickLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Blogs", href: "/blogs" },
    { name: "Our Story", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { name: "Terms", href: "/policies/terms" },
    { name: "Shipping", href: "/policies/shipping" },
    { name: "Refund", href: "/policies/refund" },
    { name: "Privacy", href: "/policies/privacy" },
  ];

  const socialIcons = [
    {
      label: "Instagram",
      href: "#",
      SVG: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      )
    },
    {
      label: "Facebook",
      href: "#",
      SVG: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      )
    },
    {
      label: "LinkedIn",
      href: "#",
      SVG: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      )
    },
    {
      label: "Twitter",
      href: "#",
      SVG: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-[#6c3518] text-[#f5f1e6] font-sans pt-32 pb-12 overflow-hidden">
      {/* 🌪️ Optimized CSS Noise Texture (No Network Request) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />
      
      {/* 🌸 Floating Botanical Detail (GPU Accelerated) */}
      <motion.div 
        animate={{ 
          y: [0, -40, 0],
          x: [0, 20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[15%] opacity-[0.08] pointer-events-none will-change-transform"
      >
        {/* <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M12 2L12 22M12 2C12 2 4 7 4 12C4 17 12 22 12 22M12 2C12 2 20 7 20 12C20 17 12 22 12 22M4 12H20" />
        </svg> */}
      </motion.div>

      {/* 🌫️ Ambient Organic Blobs (GPU Accelerated) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            x: ["-10%", "10%", "-10%"],
            opacity: [0.04, 0.08, 0.04]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[120%] bg-[#8B4513] rounded-[40%_60%_70%_30%_/_50%_40%_60%_50%] blur-[120px] will-change-transform" 
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 1, 1.3],
            x: ["10%", "-10%", "10%"],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[100%] bg-[#A0522D] rounded-[60%_40%_30%_70%_/_40%_50%_50%_60%] blur-[100px] will-change-transform" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- NEWSLETTER SECTION: Enter the Ritual --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-b border-white/5 pb-20"
        >
          <div className="max-w-md">
            <h3 className="text-[11px] uppercase tracking-[0.6em] font-bold text-white/30 mb-6 italic">Join Indevie</h3>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#f5f1e6] leading-[1.1] mb-6">
              Receive curated insights from us.
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full md:w-[400px] relative group">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-4 text-sm tracking-[0.3em] font-light focus:outline-none focus:border-white transition-colors placeholder:text-white/20 uppercase"
              required
            />
            <button 
              type="submit"
              className="absolute right-0 bottom-4 text-xs tracking-[0.4em] font-bold opacity-40 hover:opacity-100 transition-opacity uppercase"
            >
              {isSubmitted ? "SUBMITTED" : "JOIN"}
            </button>
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-8 left-0 text-[10px] tracking-widest text-white/60"
                >
                  Welcome to Indevie.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8 lg:gap-8 mb-24">
          
          {/* COLUMN 1: IDENTITY */}
          <div className="col-span-2 sm:col-span-1 space-y-10">
             <Link href="/" className="inline-block relative w-44 h-20 group overflow-hidden">
                <Image 
                  src="/images/logo.png" 
                  alt="INDEVIE" 
                  fill 
                  sizes="176px"
                  className="object-contain brightness-0 invert opacity-90 transition-transform duration-700 group-hover:scale-[1.03]" 
                  priority
                />
            </Link>
            <p className="text-[14px] font-light leading-relaxed text-[#f5f1e6]/60 max-w-[280px] tracking-wide">
              Botanical treasures handcrafted with ancient wisdom to nurture your modern radiance, naturally.
            </p>
            <div className="flex items-center gap-3 opacity-20 pt-4">
               <MapPin size={10} strokeWidth={2.5} />
               <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Indore, India</span>
            </div>
          </div>

          {/* COLUMN 2: EXPLORE */}
          <div className="space-y-10 lg:pl-12">
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/25 italic">Explore</h4>
            <ul className="space-y-5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-4 text-[14px] font-light tracking-wide text-[#f5f1e6]/70 hover:text-white transition-colors">
                    <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-4" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: SERVICES */}
          <div className="space-y-10">
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/25 italic">Services</h4>
            <ul className="space-y-5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-4 text-[14px] font-light tracking-wide text-[#f5f1e6]/70 hover:text-white transition-colors">
                    <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-4" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CONNECT */}
          <div className="col-span-2 sm:col-span-1 space-y-10">
            <h4 className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/25 italic">Connect</h4>
            <div className="space-y-8">
              <div className="space-y-4">

                <div className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                  <MapPin size={16} strokeWidth={1.5} />
                  <span className="text-[14px] font-light tracking-wide">Indore, Madhya Pradesh, India</span>
                </div>
                <a href="mailto:care@indevie.in" className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                  <Mail size={16} strokeWidth={1.5} />
                  <span className="text-[14px] font-light tracking-wide">care@indevie.in</span>
                </a>
                <a href="tel:+919998887777" className="flex items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                  <Phone size={16} strokeWidth={1.5} />
                  <span className="text-[14px] font-light tracking-wide">+91 9998887777</span>
                </a>
              </div>

              {/* Sophisticated Socials with Magnetic Pull */}
              <div className="flex gap-4 pt-4">
                {socialIcons.map(({ SVG, href, label }) => (
                  <Magnetic key={label}>
                    <Link 
                      href={href}
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-all duration-500 group"
                      aria-label={label}
                    >
                      <span className="relative z-10 transition-transform duration-500 scale-90 group-hover:scale-[1.15]">
                        <SVG />
                      </span>
                    </Link>
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: The Signature Line */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[9px] uppercase tracking-[0.4em] font-light opacity-30 text-center md:text-left">
            © {new Date().getFullYear()} All rights are reserved for INDEVIE Beauty.
          </p>
          
          <Magnetic>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex items-center gap-4 text-[9px] uppercase tracking-[0.5em] font-bold"
            >
              <span className="opacity-30 group-hover:opacity-100 transition-opacity">Back to top</span>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#f5f1e6] group-hover:text-black transition-all duration-500 shadow-xl">
                 <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" />
              </div>
            </button>
          </Magnetic>
        </div>
      </div>
      
      {/* 🎭 GIANT PARALLAX SIGNATURE (Reveal on Scroll) */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 0.03, y: 20 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -bottom-[1vw] left-0 w-full select-none pointer-events-none text-center"
      >
         <h2 className="text-[30vw] font-serif italic tracking-tighter leading-none whitespace-nowrap overflow-hidden">
           Indevie
         </h2>
      </motion.div>
    </footer>
  );
};

export default Footer;
