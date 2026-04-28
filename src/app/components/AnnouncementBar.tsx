"use client";

import React from "react";
import { motion } from "framer-motion";

const announcementItems = [
  "Fall in Love with your glow",
  "Flat 20% OFF Sitewide",
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
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap will-change-transform"
        >
          {/* Loop twice for seamless scrolling */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-12 px-6 items-center">
              {announcementItems.map((item, index) => (
                <span 
                  key={index} 
                  className="text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] flex-shrink-0"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
