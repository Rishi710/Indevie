"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BrandMantra() {
  return (
    <section className="pt-12 md:pt-12 pb-12 md:pb-12 px-6 text-center bg-[#f5f1e6]">
      <div className="max-w-5xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl lg:text-5xl font-poppins text-[#6c3518] leading-[1.3]"
        >
          &quot;Clean. Conscious. Created for <strong className="font-bold">Indian skin</strong> that deserves more&quot;
        </motion.h2>
      </div>
    </section>
  );
}
