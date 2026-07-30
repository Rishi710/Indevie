"use client";

import Image from "next/image";
import { User, MapPin, Star, StarHalf } from "lucide-react";

export default function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      name: "Aditi",
      age: "30",
      location: "Hyderabad",
      rating: 5,
      text: "I didn’t realise how much tension I carry in my body until I started using this. I apply Calm Balm on my neck and feet at night and within minutes, I feel calmer. It’s become my go-to wind-down ritual",
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/333.webp?v=1778163425" // Placeholder
    },
    {
      id: 2,
      name: "Nikky",
      age: "25",
      location: "Ahmedabad",
      rating: 4.5, // Half star example
      text: "My skin feels softer instantly after applying Indevie Maalish oil, but the real difference is the glow. It doesn’t just sit on the skin, it actually absorbs and nourishes.",
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/111_2.webp?v=1778094990"
    },
    {
      id: 3,
      name: "Anushka",
      age: "30",
      location: "Indore",
      rating: 5,
      text: "I have really dry skin and most lotions feel either sticky or not enough. Indevie Kalakand Body Lotion is different. It’s rich but absorbs well, and my skin feels comfortable all day. Oh, and it smells like my favourite dessert!",
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/222.webp?v=1778094296"
    },
    {
      id: 4,
      name: "Nivedita",
      age: "47",
      location: "Pune",
      rating: 5, // Half star example
      text: "I am absolutely in love with how my skin feels after applying Kalakand Body Lotion. It has soothed the irritation and dryness in my skin, in just a few days.",
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/444.webp?v=1778094297"
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} size={15} fill="#FFD700" color="#FFD700" />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalf key={i} size={15} fill="#FFD700" color="#FFD700" />);
      } else {
        stars.push(<Star key={i} size={15} color="#FFD700" className="opacity-20" />);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <section className="w-full bg-[#110f0e] py-20 md:py-28 relative overflow-hidden">
      {/* Creative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6c3518] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#d4af37] rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <div className="max-w-[1500px] mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-10 md:mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-inter text-[#f5f1e6] italic mb-4">
            Hear It From Our Community
          </h2>
          <div className="w-16 md:w-20 h-[1px] bg-[#d4af37]/40"></div>
        </div>

        {/* Horizontal scroll on Mobile, 4 Columns on Desktop */}
        <div
          className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0 px-4 sm:px-10 lg:px-16 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="w-[75vw] min-w-[75vw] sm:w-[50vw] sm:min-w-[50vw] md:w-auto md:min-w-0 snap-center shrink-0 flex flex-col bg-white/[0.03] backdrop-blur-xl rounded-[16px] md:rounded-[20px] overflow-hidden shadow-2xl border border-white/[0.08] transition-transform duration-500 hover:-translate-y-2"
            >
              {/* Media Container with Gradient overlay */}
              <div className="w-full aspect-square md:aspect-[4/4.5] relative bg-black/40">
                <Image
                  src={item.image}
                  alt={`Review by ${item.name}`}
                  fill
                  className="object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {/* Subtle fade to blend into the glass card */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#161413] to-transparent opacity-90" />

                {/* Floating Gold Stars with Half-Star Support */}
                <div className="absolute bottom-4 left-5 z-10 drop-shadow-md">
                  {renderStars(item.rating)}
                </div>
              </div>

              {/* Content Container */}
              <div className="p-4 md:p-7 flex flex-col flex-grow relative bg-[#161413]">

                {/* Elegant Quote Paragraph */}
                <div className="relative mb-6 md:mb-8 mt-2 flex-grow">
                  <span className="absolute -top-6 -left-2 text-5xl md:-top-7 md:-left-3 md:text-6xl text-[#d4af37]/20 font-inter leading-none select-none">"</span>
                  <p className="text-gray-300 text-[13px] md:text-[15px] leading-relaxed italic z-10 relative font-light pl-1 md:pl-0">
                    {item.text}
                  </p>
                </div>

                {/* Meta Details Row (Name + Icons) */}
                <div className="mt-auto border-t border-white/[0.08] pt-4 md:pt-5">
                  <h3 className="text-[15px] md:text-[17px] font-inter font-medium text-[#f5f1e6] mb-2 md:mb-3">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center text-gray-400 gap-x-4 gap-y-1.5 md:gap-x-5 md:gap-y-2">
                    <div className="flex items-center gap-1.5 focus:outline-none">
                      <User size={13} strokeWidth={1.5} className="text-[#d4af37] md:w-[15px]" />
                      <span className="font-medium text-[10px] md:text-[11px] uppercase tracking-widest text-gray-300">Age {item.age}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} strokeWidth={1.5} className="text-[#d4af37] md:w-[15px]" />
                      <span className="font-medium text-[10px] md:text-[11px] uppercase tracking-widest text-gray-300">{item.location}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
