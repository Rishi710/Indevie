"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useSpring 
} from "framer-motion";

export default function ShopBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // 🌿 SCROLL PARALLAX (Subtle vertical movement)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scrollY1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const scrollY2 = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const scrollY3 = useTransform(scrollYProgress, [0, 1], [30, -30]);

  // 🌿 MOUSE INTERACTION (Interactive perspective)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse movement
  const springX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Map mouse position to image movement
  const mX1 = useTransform(springX, [-0.5, 0.5], [40, -40]);
  const mY1 = useTransform(springY, [-0.5, 0.5], [40, -40]);
  
  const mX2 = useTransform(springX, [-0.5, 0.5], [-50, 50]);
  const mY2 = useTransform(springY, [-0.5, 0.5], [-50, 50]);

  // Tilt for the main image
  const rotateX = useTransform(springY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  return (
    <section 
      ref={sectionRef} 
      onMouseMove={handleMouseMove}
      className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-[#1a0e08] group"
    >
      {/* 🌿 DEPTH LAYER 0: FIXED BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 opacity-40 grayscale-[0.3]"
        style={{
          backgroundImage: "url('/images/ig-6.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      />
    </section>
  );
}
