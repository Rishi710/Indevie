"use client";

import React from "react";
import { motion } from "framer-motion";

const tickerItems = [
  "Not just Ayurveda, its Genurveda",
  " Ancient Ritual, Reimagined",
  "Ayurvedic Quick-Fix for the 'busiest'",
];

export default function InfiniteTicker() {
  return (
    <div className="w-full bg-[#B40417] border-y border-black/5 py-2 md:py-2 overflow-hidden flex items-center">
      <motion.div
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex w-max whitespace-nowrap will-change-transform"
      >
        {/* Loop to ensure seamless scroll */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center">
            {tickerItems.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-sm md:text-sm lg:text-sm font-inter font-medium text-white uppercase tracking-[0.15em] px-8">
                  {item}
                </span>
                {/* Rounded Black Dot Divider */}
                <span className="w-1 h-1 md:w-1 md:h-1 bg-white rounded-full flex-shrink-0" />
              </React.Fragment>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
