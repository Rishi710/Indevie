"use client";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "/images/DSC_6479.jpg",
    title: "Rub Away The Stress",
    subtitle: "Heavy Head? Find instant relief",
    cta: "SHOP CALM BALM",
    link: "/shop/products/calm-balm",
  },
  {
    id: 2,
    image: "/images/DSC_6484.jpg",
    title: "Feed Your Skin",
    subtitle: "Glow Maalish Oil is skin food",
    cta: "SHOP GLOW OIL",
    link: "/shop/products/oils",
  },
  {
    id: 3,
    image: "/images/DSC_6451.jpg",
    title: "Indulgence in Every Drop",
    subtitle: "A body lotion inspired by Kalakand",
    cta: "SHOP LOTION",
    link: "/shop/products/kalakand-lotion",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function HeroSlider() {
  const [[page, direction], setPage] = useState([0, 0]);

  // We only have 3 slides, so we wrap the index
  const index = ((page % slides.length) + slides.length) % slides.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // ✅ PRELOAD IMAGES (fix flicker)
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
    });
  }, []);

  // ✅ AUTO SLIDE
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [page]); // Restart timer on page change

  // ✅ SCROLL PARALLAX
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 120]);

  // ✅ MOUSE PARALLAX
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;

    const x = (e.clientX / innerWidth - 0.5) * 30;
    const y = (e.clientY / innerHeight - 0.5) * 30;

    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
        >
          {/* 🔥 PARALLAX BACKGROUND */}
          <motion.div
            style={{
              y: yBg,
              x: mouseX,
            }}
            className="absolute inset-0"
          >
            <Image
              src={slides[index].image}
              alt="hero"
              fill
              sizes="100vw"
              priority
              className="object-cover scale-110"
            />
          </motion.div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* 🔥 CONTENT */}
          <motion.div
            style={{
              x: useTransform(mouseX, (v) => -v * 0.3),
              y: useTransform(mouseY, (v) => -v * 0.3),
            }}
            className="relative h-full flex flex-col justify-center items-center text-center px-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-5xl md:text-7xl font-serif mb-6"
            >
              {slides[index].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl"
            >
              {slides[index].subtitle}
            </motion.p>

            <Link
              href={slides[index].link}
              className="border border-white px-8 py-3 text-white uppercase tracking-widest hover:bg-white hover:text-black transition"
            >
              {slides[index].cta}
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* DOT NAVIGATION */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              const diff = i - index;
              if (diff !== 0) {
                setPage([page + diff, diff > 0 ? 1 : -1]);
              }
            }}
            className={`h-2 rounded-full cursor-pointer transition-all ${
              i === index ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}