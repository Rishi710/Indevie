"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  subtext: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "My favourite is the Glow Maalish Oil. It’s so smooth, it feels like having your own spa at home. The texture is exceptional, something you hardly find anywhere else. I love the natural jasmine fragrance. Overall, 10/10.",
    name: "Aayushi Gupta",
    subtext: "Architect",
    image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/1.jpg", 
  },
  {
    id: 2,
    quote: "My freelancing career has only kept me running from one place to another. I never cared for my skin the way I should have. But honestly, the Kalakand Skin Barrier Body Lotion and Calm Balm have given my skin a new life. They’re truly worth it.",
    name: "Shiny W.",
    subtext: "Freelance Content Writer",
    image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/4_dd424b62-06f4-4679-9232-71d01a7b10f4.jpg", 
  },
  {
    id: 3,
    quote: "I only remember coming home so tired and unable to sleep, until I discovered the Calm Balm. It has turned my sleepless nights into a moment I actually look forward to. I carry it everywhere I go, happily sniffing my way through life.",
    name: "Anant N.",
    subtext: "Entrepreneur",
    image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/1.jpg",
  }
];

export default function HomeTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <section className="w-full bg-[#ffffff] py-20 lg:py-32 overflow-hidden flex flex-col items-center">
      <div className="max-w-5xl w-full px-6 relative h-[450px] md:h-[400px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
            }}
            className="absolute inset-0 flex flex-col items-center text-center justify-center pointer-events-none"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill="#f7a9a8"
                  stroke="none"
                  className="drop-shadow-sm"
                />
              ))}
            </div>

            {/* Quote */}
            <h2 className="text-2xl md:text-4xl lg:text-[32px] font-poppins leading-[1.3] text-[#6c3518] italic max-w-3xl mb-10 px-4 md:px-0 select-none">
                &quot; {testimonials[currentIndex].quote} &quot;
            </h2>

            {/* Profile */}
            <div className="flex items-center gap-4 mt-4 select-none">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#6c3518]/10">
                <Image
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="text-left">
                <p className="text-[12px] md:text-sm font-poppins font-bold tracking-[0.1em] text-[#6c3518]/80 uppercase">
                  {testimonials[currentIndex].name}
                </p>
                <p className="text-[10px] md:text-[11px] font-poppins text-[#6c3518]/60 italic tracking-wide">
                  {testimonials[currentIndex].subtext}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center gap-2.5 mt-10 md:mt-16 z-20">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`transition-all duration-500 rounded-full h-[3px] ${
              idx === currentIndex 
                ? "bg-[#6c3518] w-8 md:w-10" 
                : "bg-[#6c3518]/20 w-3 hover:bg-[#6c3518]/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
