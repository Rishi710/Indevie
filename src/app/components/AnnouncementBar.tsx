"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const announcementItems = [
  "Fully Fed Skin is Healthy Skin",
  // "Flat 20% OFF Sitewide",
  "Travel Minis: Any 2 Save 5% · Any 4 Save 10%",
  "Free Shipping On All Orders Above ₹499",
];

// Scroll speed in pixels per second. Lower = slower. The animation time is worked
// out from the text's real width, so adding or editing messages never changes
// how fast the bar moves. (It used to be a fixed 35-40 s, ~160 px/s: too fast to read.)
const SPEED_PX_PER_SEC_DESKTOP = 60;
const SPEED_PX_PER_SEC_MOBILE = 50;

interface AnnouncementBarProps {
  onClose: () => void;
}

export default function AnnouncementBar({ onClose }: AnnouncementBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(120);

  useEffect(() => {
    const update = () => {
      const track = trackRef.current;
      if (!track) return;
      const speed = window.innerWidth < 500 ? SPEED_PX_PER_SEC_MOBILE : SPEED_PX_PER_SEC_DESKTOP;
      // The track moves half its width per loop; round to 5 s so tiny width
      // changes (e.g. the font finishing loading) don't restart the animation.
      const seconds = track.scrollWidth / 2 / speed;
      setDuration(Math.max(10, Math.round(seconds / 5) * 5));
    };

    update();
    document.fonts?.ready.then(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative bg-[#B40417] text-white overflow-hidden py-2 border-b border-[#B40417]/10 flex items-center">
      <div className="flex-1 overflow-hidden">
        <motion.div
          ref={trackRef}
          key={duration}
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex w-max whitespace-nowrap will-change-transform"
        >
          {/* Loop twice for seamless scrolling */}
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex space-x-12 px-6 items-center">
              {announcementItems.map((item, index) => (
                <span
                  key={index}
                  className="text-[13px] md:text-22px font-inter font-medium uppercase tracking-[0.2em] flex-shrink-0"
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
