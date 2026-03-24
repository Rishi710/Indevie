"use client";

import React from "react";
import { motion } from "framer-motion";

const announcementItems = [
  "Fall in Love with your glow",
  "Flat 20% OFF Sitwide",
  "Enjoy Free Shipping Across India",
];

interface AnnouncementBarProps {
  onClose: () => void;
}

export default function AnnouncementBar({ onClose }: AnnouncementBarProps) {
  return (
    <div className="relative bg-[#B40417] text-[#EFE8D9] overflow-hidden py-2 border-b border-[#B40417]/10 flex items-center">
      <div className="flex-1 overflow-hidden">
        <motion.div
          animate={{
            x: ["-50%", "0%"],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap"
          style={{ width: "200%" }}
        >
          {/* Duplicate content blocks for seamless looping */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex space-x-16 px-8 items-center w-1/2 justify-around">
              {announcementItems.map((item, index) => (
                <span 
                  key={index} 
                  className="text-[10px] md:text-xs font-medium uppercase tracking-[0.5em] flex-shrink-0"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Close Button - positioned absolute but within the bar's height */}
      <button
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFE8D9]/80 hover:text-white transition-colors z-10 bg-[#B40417] pl-3 h-full flex items-center"
        aria-label="Close announcement"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
