"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";

export default function ProductFaqSection({ productHandle }: { productHandle: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  // You can customize this object by adding different product handles as keys
  const faqDataMap: Record<string, {
    image: string;
    faqs: { question: string; answer: string }[];
  }> = {
    // ---- PRODUCT 1 ---- 
    // Replace 'your-product-handle-1' with your actual Shopify product handle (e.g. 'calm-balm')
    "indevie-calm-balm": {
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/1_240x240.jpg?v=1771916802",
      faqs: [
        { question: "How do I use Calm Balm?", answer: "Apply a small amount of Calm Balm to the desired area and gently massage it in until fully absorbed. Use it as needed, typically once or twice a day, or as directed on the product packaging. For best results, apply after cleansing or before bedtime to enjoy its calming effects" },
        { question: "Is Calm Balm suitable for sensitive skin?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
        { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
        { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals." },
      ]
    },

    // ---- PRODUCT 2 ---- 
    "indevie-kalakand-body-lotion": {
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/2_240x240.jpg?v=1771916802",
      faqs: [
        { question: "How do I use Kalakand Skin Barrier Milk?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
        { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
        { question: "Can we apply both kalakand Lotion and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
        { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
        { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" }
      ]
    },
    // ---- PRODUCT 2 ---- 
    "indevie-glow-maalish-oil": {
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/3_240x240.jpg?v=1771916802",
      faqs: [
        { question: "How do I use Glow Maalish Oil?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
        { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
        { question: "Can we apply both Kalakand Skin Barrier Milk and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
        { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
        { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" }
      ]
    },
    // ---- PRODUCT 2 ---- 
    "the-ultimate-care-ritual-set": {
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/4_240x240.jpg?v=1771916802",
      faqs: [
        { question: "How do I use The Ultimate Care Ritual Set?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
        { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
        { question: "Can we apply both Kalakand Skin Barrier Milk and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
        { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
        { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" }
      ]
    },
    
    // ---- FALLBACK DEFAULT ---- 
    // This shows up on any product that doesn't match the specific handles above
    "default": {
      image: "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/1_240x240.jpg?v=1771916802", // Aesthetic lifestyle/product image
      faqs: [
        {
          question: "How do I incorporate this into my daily routine?",
          answer: "Apply a generous amount to clean, dry skin immediately after showering. Massage in upward, circular motions until fully absorbed for a radiant finish."
        },
        {
          question: "Is this suitable for deeply sensitive skin?",
          answer: "Absolutely. Our formula is meticulously crafted without harsh chemicals, synthetic dyes, or artificial fragrances to ensure it soothes even the most reactive skin."
        },
        {
          question: "How long will one bottle typically last?",
          answer: "With daily use as recommended, a single bottle typically lasts between 4 to 6 weeks, providing over a month of deep hydration."
        },
        {
          question: "Can I layer this with other active serums?",
          answer: "Yes, it serves as an excellent occlusive layer. Apply your lighter, water-based serums first, and use this as the final step to lock in all the active ingredients."
        },
        {
          question: "When will I begin to see noticeable results?",
          answer: "You will feel an immediate difference in softness and hydration upon first touch. Visibly improved skin texture and barrier repair generally occur within 14 days of consistent use."
        }
      ]
    }
  };

  const content = faqDataMap[productHandle] || faqDataMap["default"];

  return (
    <section className="w-full bg-white py-20 lg:py-32 overflow-hidden border-t border-[#e5e5e5]/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* --- LEFT SIDE: SIMPLE BEAUTIFUL IMAGE --- */}
          <div className="relative w-full flex justify-center lg:justify-start lg:pl-4">
             <div className="relative w-full max-w-[500px] lg:w-[90%] aspect-[4/5] rounded-[16px] overflow-hidden bg-[#f5f1e6]">
                 <Image 
                   src={content.image} 
                   alt="FAQ highlight" 
                   fill 
                   className="object-cover" 
                   sizes="(max-width: 1024px) 100vw, 50vw"
                 />
                 {/* Subtle dark overlay just to make the image richer */}
                 <div className="absolute inset-0 bg-black/[0.03] pointer-events-none" />
             </div>
          </div>

          {/* --- RIGHT SIDE: SIMPLE, CLEAN ACCORDION --- */}
          <div className="flex flex-col lg:pr-8">
            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-poppins font-medium mb-10 lg:mb-14 text-[#2a2a2a] tracking-tight leading-tight">
              Frequently Asked <br/><span className="text-[#6c3518]">Questions</span>
            </h2>

            <div className="flex flex-col border-t border-[#e5e5e5]">
               {content.faqs.map((faq, idx) => {
                 const isOpen = openIndex === idx;
                 return (
                   <div 
                     key={idx} 
                     className="border-b border-[#e5e5e5]"
                   >
                     <button
                       onClick={() => setOpenIndex(isOpen ? null : idx)}
                       className="w-full flex items-center justify-between py-5 md:py-6 text-left group focus:outline-none"
                     >
                       {/* Simple Question Styling */}
                       <span className={`text-[15px] md:text-[16px] font-poppins font-medium transition-colors duration-300 pr-6 leading-snug ${
                          isOpen ? 'text-[#6c3518]' : 'text-[#2a2a2a] group-hover:text-[#6c3518]'
                       }`}>
                         {faq.question}
                       </span>
                       
                       {/* Simple Plus/Minus icon */}
                       <span className="shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300">
                         {isOpen ? (
                           <Minus size={20} className="text-[#6c3518]" />
                         ) : (
                           <Plus size={20} className="text-[#aaa] group-hover:text-[#6c3518]" />
                         )}
                       </span>
                     </button>
                     
                     {/* Answer Content Dropdown */}
                     <div 
                       className={`grid transition-all duration-300 ease-in-out ${
                         isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                       }`}
                     >
                       <div className="overflow-hidden">
                         <p className="pb-6 pr-8 text-[14px] md:text-[14.5px] font-poppins text-[#666] leading-relaxed">
                           {faq.answer}
                         </p>
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
