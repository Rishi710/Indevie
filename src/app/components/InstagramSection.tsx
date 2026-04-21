// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";

// const InstagramIcon = ({ size = 24 }: { size?: number }) => (
//   <svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="1.5"
//   >
//     <rect x="2" y="2" width="20" height="20" rx="5" />
//     <circle cx="12" cy="12" r="4" />
//     <circle cx="17.5" cy="6.5" r="1" />
//   </svg>
// );

// const instagramPosts = [
//   "https://www.instagram.com/p/DT7u4AWjCQr/",
//   "https://www.instagram.com/p/DWyhEPPjCxI/",
//   "https://www.instagram.com/p/DWTr_pQDI8D/",
//   "https://www.instagram.com/p/DT7u4AWjCQr/",
// ];

// export default function InstagramSection() {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const [loadInstagram, setLoadInstagram] = useState(false);

//   // 🔥 Lazy Load when visible
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setLoadInstagram(true);
//         }
//       },
//       { threshold: 0.3 }
//     );

//     if (sectionRef.current) observer.observe(sectionRef.current);

//     return () => observer.disconnect();
//   }, []);

//   // 🔥 Load Instagram script only when needed
//   useEffect(() => {
//     if (!loadInstagram) return;

//     const script = document.createElement("script");
//     script.src = "https://www.instagram.com/embed.js";
//     script.async = true;

//     script.onload = () => {
//       if ((window as any).instgrm) {
//         (window as any).instgrm.Embeds.process();
//       }
//     };

//     document.body.appendChild(script);
//   }, [loadInstagram]);

//   return (
//     <section
//       ref={sectionRef}
//       className="py-12 bg-white overflow-hidden"
//     >
//       <div className="max-w-7xl mx-auto px-4">
        
//         {/* Header */}
//         <div className="text-center mb-10">
//           <Link
//             href="https://www.instagram.com/indeviebeauty"
//             target="_blank"
//             className="inline-flex items-center gap-3 text-[#6c3518]"
//           >
//             <h2 className="text-2xl md:text-3xl font-medium">
//               @indeviebeauty
//             </h2>
//           </Link>
//         </div>

//         {/* 🔥 Scroll Container */}
//         <div
//           ref={scrollRef}
//           className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
//           style={{
//             scrollbarWidth: "none",
//             WebkitOverflowScrolling: "touch",
//           }}
//           onMouseDown={(e) => {
//             const el = scrollRef.current;
//             if (!el) return;

//             let startX = e.pageX - el.offsetLeft;
//             let scrollLeft = el.scrollLeft;

//             const onMouseMove = (e: MouseEvent) => {
//               const x = e.pageX - el.offsetLeft;
//               const walk = (x - startX) * 2;
//               el.scrollLeft = scrollLeft - walk;
//             };

//             const onMouseUp = () => {
//               document.removeEventListener("mousemove", onMouseMove);
//               document.removeEventListener("mouseup", onMouseUp);
//             };

//             document.addEventListener("mousemove", onMouseMove);
//             document.addEventListener("mouseup", onMouseUp);
//           }}
//         >
//           {/* 🔥 Conditional Rendering */}
//           {loadInstagram ? (
//             instagramPosts.map((url, index) => (
//               <div
//                 key={index}
//                 className="min-w-[300px] sm:min-w-[320px] md:min-w-[350px] snap-center"
//               >
//                 <blockquote
//                   className="instagram-media w-full"
//                   data-instgrm-permalink={url}
//                   data-instgrm-version="14"
//                   style={{
//                     background: "#fff",
//                     border: 0,
//                     margin: 0,
//                     width: "100%",
//                   }}
//                 ></blockquote>
//               </div>
//             ))
//           ) : (
//             // 🔥 Skeleton Loader (important for UX)
//             <div className="flex gap-6">
//               {[1, 2, 3].map((item) => (
//                 <div
//                   key={item}
//                   className="min-w-[300px] h-[400px] bg-gray-100 animate-pulse rounded-lg"
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
  {
    id: 1,
    image: "/images/ig-1.jpg",
    url: "https://www.instagram.com/p/DXJu-MlANkC/",
  },
  {
    id: 2,
    image: "/images/ig-2.jpg",
    url: "https://www.instagram.com/p/DW_bN8QDPtq/",
  },
  {
    id: 3,
    image: "/images/ig-3.jpg",
    url: "https://www.instagram.com/p/DWyhEPPjCxI/",
  },
  {
    id: 4,
    image: "/images/ig-4.png",
    url: "https://www.instagram.com/p/DWTr_pQDI8D/",
  },
  {
    id: 5,
    image: "/images/ig-5.jpg",
    url: "https://www.instagram.com/p/DT7u4AWjCQr/",
  },
];

export default function InstagramSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 bg-white overflow-hidden">
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

        {/* 🔥 Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none" }}
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
          {instagramPosts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ y: -5 }}
              className="min-w-[220px] sm:min-w-[240px] md:min-w-[260px] aspect-square shrink-0 snap-center relative rounded-lg overflow-hidden group"
            >
              {/* Image */}
              <Image
                src={post.image}
                alt="Instagram post"
                fill
                sizes="(max-width: 768px) 220px, (max-width: 1024px) 240px, 260px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="bg-white p-3 rounded-full">
                  <InstagramIcon size={20} />
                </div>
              </div>

              {/* Link */}
              <Link
                href={post.url}
                target="_blank"
                className="absolute inset-0 z-10"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}