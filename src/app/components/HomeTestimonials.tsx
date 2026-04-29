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
    image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/1_86824398-6c97-4a70-9e2a-5157d1f893b4.jpg?v=1771928504", 
  },
  {
    id: 2,
    quote: "My freelancing career has only kept me running from one place to another. I never cared for my skin the way I should have. But honestly, the Kalakand Skin Barrier Body Lotion and Calm Balm have given my skin a new life. They’re truly worth it.",
    name: "Shiny W.",
    subtext: "Freelance Content Writer",
    image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/2_9d58d24e-84bd-4ba4-8e81-ec497af09208.jpg?v=1771928505", 
  },
  {
    id: 3,
    quote: "I only remember coming home so tired and unable to sleep, until I discovered the Calm Balm. It has turned my sleepless nights into a moment I actually look forward to. I carry it everywhere I go, happily sniffing my way through life.",
    name: "Anant N.",
    subtext: "Entrepreneur",
    image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/3_e07c3362-0506-4a21-acf7-495c40cf6998.jpg?v=1771928504",
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
    <section className="w-full bg-[#ffffff] py-5 lg:py-15 overflow-hidden flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-6 md:mb-10 gap-3 px-4">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold mt-10 md:mt-16 text-[#6c3518]/60">
            Real Experiences
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#6c3518]">
            <span className="font-poppins font-semibold italic">Hear it from the Enthusiasts</span>
          </h2>
        </div>
      <div className="max-w-5xl w-full px-5 relative h-[260px] sm:h-[280px] md:h-[250px] flex items-center justify-center">
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
            className="absolute inset-0 flex flex-col items-center text-center justify-start pointer-events-none w-full"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-5 md:mb-8">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill="#FFD700"
                  stroke="none"
                  className="drop-shadow-sm"
                />
              ))}
            </div>

            {/* Quote */}
            <h2 className="text-[15px] sm:text-[17px] md:text-2xl lg:text-[24px] font-poppins leading-[1.7] md:leading-[1.4] text-[#6c3518] italic max-w-3xl mb-6 md:mb-10 px-2 md:px-0 select-none">
                &quot; {testimonials[currentIndex].quote} &quot;
            </h2>

            {/* Profile */}
            <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4 select-none">
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
      <div className="flex items-center gap-3.5 mb-10 z-20">
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
