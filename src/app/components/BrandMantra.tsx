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
          className="text-2xl md:text-3xl lg:text-4xl font-poppins text-[#6c3518] leading-[1.3]"
        >
          &quot;<strong>Turning selfcare into soulcare.</strong>&quot; We believe in feeding the skin right, because it surely eats.
        </motion.h2> 
      </div>
    </section>
  );
}
