import React from "react";
import FaqAccordion from "../../components/FaqAccordion";

export const metadata = {
  title: 'FAQ - Indevie Beauty',
  description: 'Frequently Asked Questions about Indevie Beauty products, orders, and policies.',
}

export default function FaqPage() {
  const faqCategories = [
    {
      title: "Indevie",
      items: [
        {
          question: "What is Indevie?",
          answer: "Indevie is a premium botanical beauty brand rooted in ancient wisdom. We handcraft skincare and beauty products designed to nurture your modern radiance using natural, high-quality ingredients."
        },
        {
          question: "Why choose Indevie products?",
          answer: "Our formulations are created with meticulous attention to detail, sourcing the finest botanical ingredients. We blend traditional apothecary knowledge with modern skincare science to deliver effective, gentle, and cruelty-free products."
        },
        {
          question: "Where is Indevie based?",
          answer: "We are proudly based in Indore, Madhya Pradesh, India. Our products are formulated and crafted locally."
        }
      ]
    },
    {
      title: "The Indevie Difference",
      items: [
        {
          question: "Are your products cruelty-free?",
          answer: "Yes, absolutely. We never test on animals, and we strictly source ingredients from suppliers who share our commitment to cruelty-free practices."
        },
        {
          question: "Are the formulations suitable for sensitive skin?",
          answer: "Many of our products are designed with sensitive skin in mind, utilizing gentle botanicals. However, we always recommend reviewing the ingredient list and performing a patch test before incorporating a new product into your routine."
        },
        {
          question: "Do your products contain synthetic fragrances?",
          answer: "No. We believe in the power of nature. Any scent in our products comes naturally from the botanical extracts, essential oils, and hydrosols used in the formulation."
        }
      ]
    },
    {
      title: "Orders and Shipping",
      items: [
        {
          question: "How long does shipping take?",
          answer: "Domestic orders typically arrive within 3-5 business days. Once your order has shipped, you will receive a tracking number via email."
        },
        {
          question: "Do you ship internationally?",
          answer: "Currently, we offer shipping within India. We are working diligently to expand our capabilities to offer international shipping in the near future."
        },
        {
          question: "What is your return policy?",
          answer: "Due to the intimate nature of personal care products, we cannot accept returns on opened items. However, if your product arrives damaged or you have concerns about your order, please contact our support team within 7 days of receiving your package."
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#fdfcfaf8] pt-40 pb-24 relative overflow-hidden font-sans">
      {/* --- Aesthetic Background Elements inspired by the Reference & Indevie Theme --- */}
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />
      
      {/* Ambient Organic Blobs for the Hero Section */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none select-none overflow-hidden z-0">
        <div 
          className="absolute -top-[10%] -right-[5%] w-[60vw] max-w-[800px] aspect-square bg-[#e8dcc4] rounded-full blur-[120px] opacity-40 mix-blend-multiply" 
        />
        <div 
          className="absolute top-[10%] -left-[10%] w-[40vw] max-w-[600px] aspect-square bg-[#f2e6d8] rounded-full blur-[100px] opacity-60 mix-blend-multiply" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* --- Hero Header --- */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6 drop-shadow-sm leading-tight">
            Frequently Asked<br/>
            <span className="italic text-[#8B4513]">Questions</span>
          </h1>
          <p className="text-gray-600 font-light text-lg md:text-xl max-w-xl leading-relaxed">
            If you're new to Indevie or looking to improve your skincare ritual, this guide 
            will help you learn more about our botanical products and formulations.
          </p>
        </div>

        {/* --- FAQ Accordions --- */}
        <FaqAccordion categories={faqCategories} />
        
        {/* --- Support CTA --- */}
        <div className="mt-24 text-center max-w-xl mx-auto border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-serif text-gray-900 mb-4 tracking-wide">Still have questions?</h3>
          <p className="text-gray-600 font-light mb-8">
            Our team is here to help you find the perfect ritual for your skin.
          </p>
          <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-full text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#8B4513] transition-colors duration-300">
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
