"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-[#f5f1e6]">
      {/* Left Side: Fixed Image (Hidden on mobile as standalone, used as background) */}
      <div className="relative hidden lg:block h-full w-full bg-[#e5e5e5]">
        <Image 
          src="/images/DSC_6479.jpg"
          alt="Indevie Beauty Ritual"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/5" /> {/* Subtle overlay */}
      </div>

      {/* Right Side: Form Content */}
      <div className="relative flex items-center justify-center h-full px-6 py-12 lg:px-12 bg-[#f5f1e6] lg:bg-white/40">
        {/* Mobile Background Image */}
        <div className="absolute inset-0 lg:hidden">
            <Image 
              src="/images/DSC_6479.jpg"
              alt="Background"
              fill
              className="object-cover opacity-20"
              priority
            />
        </div>

        {/* Breadcrumb */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#6c3518] uppercase transition-all hover:gap-3 z-10"
        >
          <ArrowLeft size={12} />
          Back to Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Elegant easeOutQuart
          className="w-full max-w-sm relative z-10"
        >
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-poppins text-[#6c3518] italic mb-3 leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-gray-500 font-light font-poppins tracking-wide text-xs lg:text-sm">{subtitle}</p>
            )}
          </div>
          
          <div className="bg-white/80 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-6 lg:p-0 rounded-2xl shadow-xl shadow-[#6c3518]/5 lg:shadow-none border border-white/20 lg:border-none">
            {children}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
