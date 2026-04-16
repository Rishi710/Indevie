"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";



const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
);

const instagramPosts = [
  "https://www.instagram.com/p/DXJu-MlANkC/",
  "https://www.instagram.com/p/DW_bN8QDPtq/",
  "https://www.instagram.com/p/DWyhEPPjCxI/",
  "https://www.instagram.com/p/DWTr_pQDI8D/",
  "https://www.instagram.com/p/DT7u4AWjCQr/",
];

export default function InstagramSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    };

    document.body.appendChild(script);
  }, []);

  

  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="https://www.instagram.com/indeviebeauty"
            target="_blank"
            className="inline-flex items-center gap-3 text-[#6c3518]"
          >
            <InstagramIcon size={26} />
            <h2 className="text-2xl md:text-3xl font-medium">
              @indeviebeauty
            </h2>
          </Link>
        </div>

        {/* 🔥 Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={(e) => {
    const el = scrollRef.current;
    if (!el) return;

    let startX = e.pageX - el.offsetLeft;
    let scrollLeft = el.scrollLeft;

    const onMouseMove = (e: MouseEvent) => {
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }}
        >
          {instagramPosts.map((url, index) => (
            <div
              key={index}
              className="min-w-[300px] sm:min-w-[350px] md:min-w-[400px] snap-center"
            >
              <blockquote
                className="instagram-media w-full"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{
                  background: "#fff",
                  border: 0,
                  margin: 0,
                  width: "100%",
                }}
              ></blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}