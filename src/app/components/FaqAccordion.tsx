"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export default function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-20 relative z-10">
      {categories.map((category, catIdx) => (
        <div key={catIdx} className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 tracking-wide pb-2">
            {category.title}
          </h2>
          <div className="border-t border-gray-200">
            {category.items.map((item, itemIdx) => {
              const id = `${catIdx}-${itemIdx}`;
              const isOpen = openIndex === id;
              
              return (
                <div 
                  key={itemIdx}
                  className="border-b border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleOpen(id)}
                    className="w-full text-left py-6 flex justify-between items-center group transition-colors focus:outline-none"
                  >
                    <span className={`text-base md:text-lg font-medium pr-8 tracking-wide transition-colors duration-300 ${isOpen ? 'text-[#8B4513]' : 'text-gray-800 group-hover:text-[#8B4513]'}`}>
                      {item.question}
                    </span>
                    <div className={`flex-shrink-0 relative w-4 h-4 flex items-center justify-center transition-colors duration-300 ${isOpen ? 'text-[#8B4513]' : 'text-gray-800 group-hover:text-[#8B4513]'}`}>
                      {/* Horizontal line (always visible, rotates to horizontal when open) */}
                      <motion.span 
                        animate={{ rotate: isOpen ? 180 : 0 }} 
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute block w-full h-[1.5px] bg-current"
                      />
                      {/* Vertical line (fades/rotates out when open to form a minus shape) */}
                      <motion.span 
                        animate={{ rotate: isOpen ? 180 : 90, opacity: isOpen ? 0 : 1 }} 
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute block w-full h-[1.5px] bg-current"
                      />
                    </div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <div className="pb-8 pt-2 text-gray-500 text-sm md:text-base leading-relaxed font-light">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
