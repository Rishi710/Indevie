"use client";

import { ShopifyProduct } from "@/lib/shopify";
import Image from "next/image";
import { useState } from "react";
import { Bookmark, ShoppingBag } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";
import { useCart } from "@/app/context/CartContext";
import ReviewSection from "@/app/components/ReviewSection";
import ProductRatingBadge from "@/app/components/ProductRatingBadge";
import TestimonialSection from "@/app/components/TestimonialSection";
import ProductFaqSection from "@/app/components/ProductFaqSection";

export default function ProductPageClient({ 
  product, 
  relatedProducts = [] 
}: { 
  product: ShopifyProduct;
  relatedProducts?: ShopifyProduct[];
}) {
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "return">("details");
  const [quantity, setQuantity] = useState(1);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const { cart, addItem } = useCart();

  const images = product.images?.nodes || [];
  const firstImage = images[0];
  const restImages = images.slice(1);

  const selectedVariant = product.variants?.nodes[0];
  const variantId = selectedVariant?.id;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const formattedPrice = price ? `Rs. ${parseFloat(price.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A";
  
  const formattedComparePrice = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || "0")
    ? `MRP. ${parseFloat(compareAtPrice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const handleBuyNow = async () => {
    if (variantId) {
      await addItem(variantId, quantity);
      // addItem opens the cart by default, but for Buy Now we want to go straight to checkout if possible
      // However, we wait for cart to update or just use the checkoutUrl from the latest cart state
    }
  };

  const sizeOption = (product.options || []).find(o => o.name.toLowerCase() === 'size');

  return (
    <div className="w-full bg-[#f5f1e6] min-h-screen">
      <div className="max-w-[1500px] mx-auto w-full relative hidden md:grid md:grid-cols-[0.9fr_0.9fr_1.2fr] gap-0 pt-32 pb-20">
        
        {/* Column 1: Sticky First Image */}
        <div className="sticky top-32 p-1 pb-0 pl-10 lg:pl-5 self-start">
          <div className="w-full h-[calc(100vh-160px)] relative rounded-[14px] overflow-hidden bg-[#e5e5e5]">
            {firstImage ? (
              <Image 
                src={firstImage.url} 
                alt={firstImage.altText || product.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover" 
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
        </div>

        {/* Column 2: Scrollable Content (Remaining Images) */}
        <div className="relative p-1 pb-0 flex flex-col gap-1">
          {restImages.length > 0 ? (
             restImages.map((img, idx) => (
               <div key={idx} className="w-full aspect-[4/4.5] relative rounded-[14px] overflow-hidden bg-[#e5e5e5]">
                 <Image 
                   src={img.url} 
                   alt={img.altText || `${product.title} ${idx + 2}`} 
                   fill 
                   sizes="(max-width: 768px) 100vw, 33vw"
                   className="object-cover" 
                 />
               </div>
             ))
          ) : (
            <div className="w-full h-[50vh] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-[14px]">
               No additional images
            </div>
          )}
        </div>

        {/* Column 3: Sticky Product Info */}
        <div className="sticky top-32 py-8 px-4 pr-10 lg:pr-5 flex flex-col self-start">
           <div className="flex justify-between items-start mb-2 mt-4">
             <h1 className="text-[20px] lg:text-[22px] leading-tight font-medium text-[#6c3518] max-w-[85%]">
               {product.title}
             </h1>
             {/* <button aria-label="Save product" className="text-gray-400 hover:text-black transition-colors mt-2">
               <Bookmark size={24} />
             </button> */}
           </div>
           
           <div className="flex items-center gap-3 mb-2">
             <p className="text-[22px] text-[#2a2a2a]">{formattedPrice}</p>
             {formattedComparePrice && (
               <p className="text-[18px] text-gray-500 line-through decoration-[1.5px]">{formattedComparePrice}</p>
             )}
           </div>
           
           <div className="mb-8">
              <ProductRatingBadge productId={product.id} />
           </div>

           {/* Quantity Selector */}
           <div className="flex flex-col gap-3 mb-8">
             <span className="text-[11px] font-bold tracking-[0.15em] text-[#6c3518] uppercase">Quantity</span>
             <div className="flex items-center w-32 border border-[#6c3518]/20 rounded-[4px] bg-white/50 backdrop-blur-sm">
               <button 
                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
                 className="w-10 h-10 flex items-center justify-center text-[#6c3518] hover:bg-[#6c3518]/5 transition-colors"
               >
                 −
               </button>
               <div className="flex-1 text-center text-sm font-medium text-[#6c3518]">
                 {quantity}
               </div>
               <button 
                 onClick={() => setQuantity(quantity + 1)}
                 className="w-10 h-10 flex items-center justify-center text-[#6c3518] hover:bg-[#6c3518]/5 transition-colors"
               >
                 +
               </button>
             </div>
           </div>

           {/* Actions */}
           <div className="flex flex-col gap-3 mb-12 w-full">
             <button 
                onClick={() => variantId && addItem(variantId, quantity)}
                className="w-full bg-white border border-[#6c3518]/20 rounded-[8px] py-4 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-all duration-300 font-poppins shadow-sm"
              >
               ADD TO BAG
             </button>
             <button 
                onClick={handleBuyNow}
                className="w-full bg-[#6c3518] text-white rounded-[8px] py-4 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-all duration-500 font-poppins shadow-xl shadow-[#6c3518]/10"
              >
               BUY NOW
             </button>
           </div>

           {/* Accordion / Tabs */}
           <div className="border border-[#e5e5e5] rounded-[14px] bg-white p-5 mb-8 shadow-sm">
             <div className="flex border-b border-[#e5e5e5] mb-5">
               <button 
                 onClick={() => setActiveTab("details")}
                 className={`flex-1 pb-3 text-[12px] font-semibold text-center transition-colors ${activeTab === "details" ? "border-b-2 border-[#6c3518] text-[#6c3518]" : "text-gray-400 hover:text-[#6c3518] border-b-2 border-transparent"}`}
               >
                 Details & Description
               </button>
               <button 
                 onClick={() => setActiveTab("shipping")}
                 className={`flex-1 pb-3 text-[12px] font-semibold text-center transition-colors ${activeTab === "shipping" ? "border-b-2 border-[#6c3518] text-[#6c3518]" : "text-gray-400 hover:text-[#6c3518] border-b-2 border-transparent"}`}
               >
                Shipping & Delivery
               </button>
               <button 
                 onClick={() => setActiveTab("return")}
                 className={`flex-1 pb-3 text-[12px] font-semibold text-center transition-colors ${activeTab === "return" ? "border-b-2 border-[#6c3518] text-[#6c3518]" : "text-gray-400 hover:text-[#6c3518] border-b-2 border-transparent"}`}
               >
                 Return & Refund
               </button>
             </div>
             
             <div className="text-[13px] text-gray-600 prose prose-sm max-w-none leading-relaxed min-h-[120px]">
               {activeTab === "details" && (
                 <div className="animate-in fade-in duration-300">
                   {product.descriptionHtml ? (
                     <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                   ) : (
                     <p>{product.description || "No description available."}</p>
                   )}
                 </div>
               )}
               {activeTab === "shipping" && (
                 <div className="animate-in fade-in duration-300">
                    <p>We prepare every Indéviē order with care, and ship within 1-2 business days using eco-friendly, secure packaging. Once dispatched, you’ll receive full tracking details to follow your ritual as it journeys home to you. Delivery arrives in 3–5 days across India, with a seamless, gentle experience, just like our rituals.</p>
                 </div>
               )}
               {activeTab === "return" && (
                 <div className="animate-in fade-in duration-300">
                    <p>Not loving your glow? Return your unopened bottle within 7 days for a full refund. No questions asked, just smooth sailing.</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>

       {/* Mobile view fallback: Stacked gallery moved to slider */}
      <div className="md:hidden flex flex-col p-4 gap-6 pt-30 pb-10">
         {/* Mobile Gallery Slider */}
         <div className="relative -mx-4 group">
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={(e) => {
                const target = e.currentTarget;
                const index = Math.round(target.scrollLeft / target.clientWidth);
                if (index !== mobileImageIndex) setMobileImageIndex(index);
              }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="w-full shrink-0 snap-center px-4">
                   <div className="w-full aspect-[4/5] relative rounded-[14px] overflow-hidden bg-[#e5e5e5]">
                     <Image 
                       src={img.url} 
                       alt={img.altText || `${product.title} ${idx + 1}`} 
                       fill 
                       sizes="(max-width: 768px) 100vw, 50vw"
                       className="object-cover" 
                       priority={idx === 0}
                     />
                   </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Dots */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === mobileImageIndex ? "w-6 bg-[#6c3518]" : "w-1.5 bg-[#6c3518]/20"
                    }`}
                  />
                ))}
              </div>
            )}
         </div>
         
         <div className="flex flex-col mb-2">
           <div className="flex justify-between items-start">
             <h1 className="text-[26px] leading-tight font-medium text-[#2a2a2a] max-w-[85%]">{product.title}</h1>
             {/* <button aria-label="Save product" className="text-gray-400 hover:text-black transition-colors mt-2">
               <Bookmark size={24} />
             </button> */}
           </div>
           <div className="flex items-center gap-3 mt-2 mb-1">
             <p className="text-[22px] text-[#2a2a2a]">{formattedPrice}</p>
             {formattedComparePrice && (
               <p className="text-[18px] text-gray-500 line-through decoration-[1.5px]">{formattedComparePrice}</p>
             )}
           </div>
           <ProductRatingBadge productId={product.id} />
         </div>

         {/* Quantity Selector Mobile */}
         <div className="flex flex-col gap-3 mb-6">
            <span className="text-[11px] font-bold tracking-[0.15em] text-black uppercase">Quantity</span>
            <div className="flex items-center w-32 border border-[#e5e5e5] rounded-[8px] bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-[#2a2a2a]"
              >
                −
              </button>
              <div className="flex-1 text-center font-medium text-[#2a2a2a]">
                {quantity}
              </div>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center text-[#2a2a2a]"
              >
                +
              </button>
            </div>
         </div>

          <div className="flex flex-col gap-3 mb-6 w-full">
              <button 
                onClick={() => variantId && addItem(variantId, quantity)}
                className="w-full bg-white border border-[#6c3518]/20 rounded-[8px] py-4 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-all duration-300 font-poppins shadow-sm"
              >
                ADD TO BAG
              </button>
              <button 
                onClick={handleBuyNow}
                className="w-full bg-[#6c3518] text-white rounded-[8px] py-4 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-all duration-500 font-poppins shadow-xl shadow-[#6c3518]/10"
              >
                BUY NOW
              </button>
          </div>

         {/* Accordion / Tabs Mobile */}
         <div className="border border-[#e5e5e5] rounded-[14px] bg-white p-5 mb-8 shadow-sm">
           <div className="flex border-b border-[#e5e5e5] mb-5 overflow-x-auto hide-scrollbar">
             <button 
               onClick={() => setActiveTab("details")}
               className={`flex-1 min-w-[120px] pb-3 text-[12px] font-semibold text-center transition-colors ${activeTab === "details" ? "border-b-2 border-[#6c3518] text-[#6c3518]" : "text-gray-400 hover:text-[#6c3518] border-b-2 border-transparent"}`}
             >
               Details & Description
             </button>
             <button 
               onClick={() => setActiveTab("shipping")}
               className={`flex-1 min-w-[120px] pb-3 text-[12px] font-semibold text-center transition-colors ${activeTab === "shipping" ? "border-b-2 border-[#6c3518] text-[#6c3518]" : "text-gray-400 hover:text-[#6c3518] border-b-2 border-transparent"}`}
             >
              Shipping & Delivery
             </button>
             <button 
               onClick={() => setActiveTab("return")}
               className={`flex-1 min-w-[120px] pb-3 text-[12px] font-semibold text-center transition-colors ${activeTab === "return" ? "border-b-2 border-[#6c3518] text-[#6c3518]" : "text-gray-400 hover:text-[#6c3518] border-b-2 border-transparent"}`}
             >
               Return & Refund
             </button>
           </div>
           
           <div className="text-[13px] text-gray-600 prose prose-sm max-w-none leading-relaxed min-h-[120px]">
             {activeTab === "details" && (
               <div className="animate-in fade-in duration-300">
                 {product.descriptionHtml ? (
                   <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                 ) : (
                   <p>{product.description || "No description available."}</p>
                 )}
               </div>
             )}
             {activeTab === "shipping" && (
               <div className="animate-in fade-in duration-300">
                  <p>We prepare every Indéviē order with care, and ship within 1-2 business days using eco-friendly, secure packaging. Once dispatched, you’ll receive full tracking details to follow your ritual as it journeys home to you. Delivery arrives in 3–5 days across India, with a seamless, gentle experience, just like our rituals.</p>
               </div>
             )}
             {activeTab === "return" && (
               <div className="animate-in fade-in duration-300">
                  <p>Not loving your glow? Return your unopened bottle within 7 days for a full refund. No questions asked, just smooth sailing.</p>
               </div>
             )}
           </div>
         </div>
      </div>

      {/* Hardcoded Featured Testimonials */}
      <TestimonialSection />


      {/* Judge.me Reviews Section */}
      <div className="max-w-[1500px] mx-auto w-full md:grid md:grid-cols-[1.8fr_1.2fr] gap-0 px-4 sm:px-10 lg:px-16 pb-12">
         <div className="w-full relative col-span-1 md:col-start-1 md:pr-10 lg:pr-5">
           <ReviewSection productId={product.id} />
         </div>
      </div>

      {/* Dynamic Product FAQs */}
      <ProductFaqSection productHandle={product.handle} />
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16 py-20 border-t border-[#e5e5e5]/30">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[#6c3518] italic mb-4">Complete Your Ritual</h2>
            <div className="w-24 h-[1px] bg-[#6c3518]/20"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts.slice(0, 4).map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
