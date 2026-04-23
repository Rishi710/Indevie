"use client";

import { useEffect, useRef, useState } from "react";
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
  "https://www.instagram.com/p/DT7u4AWjCQr/",
  "https://www.instagram.com/p/DWyhEPPjCxI/",
  "https://www.instagram.com/p/DWTr_pQDI8D/",
  "https://www.instagram.com/p/DT7u4AWjCQr/",
];

export default function InstagramSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [loadInstagram, setLoadInstagram] = useState(false);

  // 🔥 Lazy Load when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadInstagram(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // 🔥 Load Instagram script only when needed
  useEffect(() => {
    if (!loadInstagram) return;

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    };

    document.body.appendChild(script);
  }, [loadInstagram]);

  return (
    <section
      ref={sectionRef}
      className="py-12 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link
            href="https://www.instagram.com/indeviebeauty"
            target="_blank"
            className="inline-flex items-center gap-3 text-[#6c3518]"
          >
             <div className="flex flex-col items-center text-center gap-5">
           <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-red-800">
             Our Instagram Feed
           </span>
             <h2 className="text-2xl md:text-3xl font-medium italic">
              @indeviebeauty
            </h2> 
        </div>
          </Link>
        </div>

        {/* 🔥 Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
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
              const walk = (x - startX) * 2;
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
          {/* 🔥 Conditional Rendering */}
          {loadInstagram ? (
            instagramPosts.map((url, index) => (
              <div
                key={index}
                className="min-w-[300px] sm:min-w-[320px] md:min-w-[350px] snap-center"
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
            ))
          ) : (
            // 🔥 Skeleton Loader (important for UX)
            <div className="flex gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="min-w-[300px] h-[400px] bg-gray-100 animate-pulse rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}