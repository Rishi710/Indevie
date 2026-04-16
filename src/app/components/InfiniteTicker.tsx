"use client";

import React from "react";
import { motion } from "framer-motion";

const tickerItems = [
  "Healing Powered by Genurveda™",
  "Ancient Ritual, Reimagined",
  "Healthy Skin, Effortless Glow",
];

export default function InfiniteTicker() {
  return (
    <div className="w-full bg-white border-y border-black/5 py-4 md:py-6 overflow-hidden flex items-center">
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
        {/* Loop to ensure seamless scroll */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center">
            {tickerItems.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-sm md:text-lg lg:text-xl font-poppins font-medium text-[#6c3518] uppercase tracking-[0.15em] px-8">
                  {item}
                </span>
                {/* Rounded Black Dot Divider */}
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full flex-shrink-0" />
              </React.Fragment>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
