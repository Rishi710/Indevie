"use client";
import Image from "next/image";


export default function ShopBanner() {
  return (
    <section 
      className="relative h-[100vh] md:h-screen w-full overflow-hidden bg-[#1a0e08] group"
    >
      {/* 🌿 DEPTH LAYER 0: RESPONSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Image
          src="/images/DSC_6440.jpg"
          alt="Shop Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
    </section>
  );
}
