"use client";

import {
  ShopifyProduct,
  getStockInfo,
  getProductBenefitsHtml,
  getProductIngredientsHtml,
  getProductHowToUseHtml,
  getProductInsideTheBoxHtml,
  getProductAdditionalInfoHtml,
  getProductConcerns,
  getProductSize,
} from "@/lib/shopify";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, ReactNode } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Bookmark, ShoppingBag, ChevronDown, Check } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";
import { useCart } from "@/app/context/CartContext";
import ReviewSection from "@/app/components/ReviewSection";
import ProductRatingBadge from "@/app/components/ProductRatingBadge";
import TestimonialSection from "@/app/components/TestimonialSection";
import { getProductFaqs } from "@/app/components/ProductFaqSection";
import { pixelViewContent } from "@/lib/pixel";
import { triggerGokwikCheckout } from "@/lib/gokwik";


// FAQs card — same header/card chrome as RichTextAccordionRow, but the body is a
// scrollable list of Q&A pairs (all shown at once) instead of a bullet list.
// Sourced from the per-handle FAQ data authored in ProductFaqSection.tsx.
function FaqAccordionRow({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  if (faqs.length === 0) return null;

  return (
    <div className="border-2 border-black bg-transparent overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-[17px] font-inter font-semibold text-[#2a2a2a]">FAQs</span>
        <ChevronDown
          size={20}
          className={`text-[#2a2a2a] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 max-h-[320px] font-inter overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <div key={i}>
                <p className="text-[15px] font-semibold text-[#2a2a2a] leading-snug flex gap-2.5">
                  <span className="w-2 h-2 mt-1.5 rounded-sm bg-[#6c3518]/40 shrink-0" />
                  {faq.question}
                </p>
                <p className="text-[14px] font-inter text-gray-500 leading-relaxed mt-1.5 pl-[18px]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Ingredients card — same header/card chrome as AccordionRow, but the body
// renders sanitized rich-text HTML (headings, bold, lists) from the real
// custom.ingredients rich_text_field metafield, instead of a flat bullet list.
function RichTextAccordionRow({ title, html }: { title: string; html: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const safeHtml = useMemo(() => (html ? DOMPurify.sanitize(html) : ""), [html]);
  if (!safeHtml) return null;

  return (
    <div className="border-2 border-black bg-transparent overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-[20px] font-inter font-semibold text-[#2a2a2a]">{title}</span>
        <ChevronDown
          size={20}
          className={`text-[#2a2a2a] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="px-6 pb-6 text-[15px] font-inter font-semibold text-[#2a2a2a] marker:text-[#6c3518] animate-in fade-in duration-200"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      )}
    </div>
  );
}

// Benefits / Ingredients / How To Use / Inside The Box / FAQs / Additional
// Information — all sourced from real Shopify metafields (or the authored
// FAQ data file), never dummy copy. Each section is its own card, and the
// whole group disappears if a product has none of these set yet.
function ProductAccordionGroup({ product }: { product: ShopifyProduct }) {
  const benefitsHtml = getProductBenefitsHtml(product);
  const ingredientsHtml = getProductIngredientsHtml(product);
  const howToUseHtml = getProductHowToUseHtml(product);
  const insideTheBoxHtml = getProductInsideTheBoxHtml(product);
  const additionalInfoHtml = getProductAdditionalInfoHtml(product);
  const faqs = getProductFaqs(product.handle);

  if (
    !benefitsHtml &&
    !ingredientsHtml &&
    !howToUseHtml &&
    !insideTheBoxHtml &&
    !additionalInfoHtml &&
    faqs.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <RichTextAccordionRow title="Benefits" html={benefitsHtml} />
      <RichTextAccordionRow title="Ingredients" html={ingredientsHtml} />
      <RichTextAccordionRow title="How To Use" html={howToUseHtml} />
      <RichTextAccordionRow title="Inside The Box" html={insideTheBoxHtml} />
      <FaqAccordionRow faqs={faqs} />
      <RichTextAccordionRow title="Additional Information" html={additionalInfoHtml} />
    </div>
  );
}

// "For: Frizzy✓ Dry✓ ..." and "Size: Travel Size" rows — both sourced from
// real Shopify metafields (custom.concern, custom.size). Each row disappears
// on its own if the product has no data for it.
function ProductForAndSize({ product }: { product: ShopifyProduct }) {
  const concerns = getProductConcerns(product);
  const size = getProductSize(product);

  if (concerns.length === 0 && !size) return null;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {concerns.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="font-semibold font-inter text-[20px] text-[#2a2a2a]">For:</span>
          {concerns.map((concern, i) => (
            <span key={concern} className="flex font-inter font-semibold text-[18px] items-center gap-1 italic text-gray-600">
              {concern}
              <Check size={20} className="text-[#B40417] text-[20px]" strokeWidth={3} />
              {i < concerns.length - 1 && <span className="text-gray-300">,</span>}
            </span>
          ))}
        </div>
      )}

      {size && (
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-[20px] text-[#2a2a2a]">Size:</span>
          <span className="px-4 py-1.5 border border-[#B40417]  bg-[#B40417]/5 text-[#B40417] font-medium text-[14px]">
            {size}
          </span>
        </div>
      )}
    </div>
  );
}

// Compact cross-sell carousel shown inline in the info column, reusing the
// same relatedProducts data as the "Complete Your Ritual" section further
// down the page — just a smaller, quick-add presentation next to the purchase
// actions, matching the reference's "Upgrade your routine" placement.
function UpgradeYourRoutineCarousel({ products }: { products: ShopifyProduct[] }) {
  const { addItem, isUpdating } = useCart();
  if (products.length === 0) return null;

  return (
    <div className="mb-8 min-w-0">
      <h3 className="text-[20px] font-inter font-bold text-[#2a2a2a] mb-4">Upgrade your routine</h3>
      <div
        className="flex gap-4 overflow-x-auto pb-1 min-w-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.slice(0, 6).map((p) => {
          const variant = p.variants?.nodes[0];
          const price = variant?.price;
          const compareAtPrice = variant?.compareAtPrice;
          const { isOutOfStock } = getStockInfo(variant);
          const image = p.images?.nodes[0];

          return (
            <div
              key={p.id}
              className="w-[320px] shrink-0 flex items-center gap-3 border-2 border-black p-3"
            >
              <Link
                href={`/products/${p.handle}`}
                className="block w-24 h-24 shrink-0 relative overflow-hidden bg-[#e5e5e5]"
              >
                {image && (
                  <Image src={image.url} alt={image.altText || p.title} fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-col gap-1.5 min-w-0">
                <Link
                  href={`/products/${p.handle}`}
                  className="text-[14px] font-semibold text-black leading-snug line-clamp-2 underline underline-offset-2"
                >
                  {p.title}
                </Link>
                <div className="flex items-center gap-1.5">
                  {price && (
                    <span className="text-[14px] font-semibold text-[#2a2a2a]">
                      ₹{Math.round(parseFloat(price.amount)).toLocaleString("en-IN")}
                    </span>
                  )}
                  {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || "0") && (
                    <span className="text-[12px] text-gray-400 line-through">
                      ₹{Math.round(parseFloat(compareAtPrice.amount)).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => variant?.id && !isOutOfStock && addItem(variant.id, 1)}
                  disabled={isOutOfStock || isUpdating}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border border-[#B40417] text-[#B40417] hover:bg-[#B40417] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#B40417] w-fit"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductPageClient({
  product,
  relatedProducts = [],
  productGridSection,
}: {
  product: ShopifyProduct;
  relatedProducts?: ShopifyProduct[];
  productGridSection?: ReactNode;
}) {
  const [quantity, setQuantity] = useState(1);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { cart, addItem } = useCart();

  // Fire ViewContent pixel event when product page loads
  useEffect(() => {
    const variant = product.variants?.nodes[0];
    const price = variant?.price;
    if (price) {
      pixelViewContent({
        id: product.id,
        variantId: variant?.id ?? null,
        title: product.title,
        price: price.amount,
        currencyCode: price.currencyCode,
      });
    }
  }, [product.id, product.title, product.variants]);

  const images = product.images?.nodes || [];

  // Sanitize merchant-authored HTML before rendering — descriptions come from
  // Shopify admin, but a compromised/misused admin account or pasted rich text
  // could otherwise inject executable markup into every visitor's browser.
  const safeDescriptionHtml = useMemo(
    () => (product.descriptionHtml ? DOMPurify.sanitize(product.descriptionHtml) : ""),
    [product.descriptionHtml]
  );

  const selectedImage = images[selectedImageIndex] || images[0];

  const selectedVariant = product.variants?.nodes[0];
  const variantId = selectedVariant?.id;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const formattedPrice = price ? `₹${parseFloat(price.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A";

  const formattedComparePrice = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || "0")
    ? `₹${parseFloat(compareAtPrice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  const { isOutOfStock, maxQuantity } = getStockInfo(selectedVariant);

  // Keep the quantity selector from ever sitting above the real cap (e.g. if
  // the merchant lowers stock while this page is already open)
  useEffect(() => {
    setQuantity((q) => Math.min(q, maxQuantity));
  }, [maxQuantity]);

  const handleBuyNow = async () => {
    if (variantId && !isOutOfStock) {
      const updatedCart = await addItem(variantId, quantity);
      if (updatedCart?.id) {
        const opened = triggerGokwikCheckout(updatedCart.id);
        if (!opened) {
          alert("Checkout is still loading — please try again in a moment.");
        }
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const sizeOption = (product.options || []).find(o => o.name.toLowerCase() === 'size');

  return (
    <div className="w-full bg-[#ffffff] min-h-screen">
      <div className="max-w-[1500px] mx-auto w-full relative hidden md:grid md:grid-cols-[1.3fr_1.2fr] gap-0 pt-42 pb-20">

        {/* Thumbnail rail + single large image — sticky so it stays pinned
            while the (usually taller) info column scrolls past it normally,
            releasing once the info column's content is exhausted. */}
        <div className="pl-10 lg:pl-40 pr-2 flex gap-3 self-start sticky top-32">
          {images.length > 1 && (
            <div
              className="flex flex-col gap-2 w-25 shrink-0 self-start max-h-[578px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-full aspect-square shrink-0 relative overflow-hidden bg-[#e5e5e5] transition-colors ${idx === selectedImageIndex ? "border-2 border-black" : "border border-black/20 hover:border-black/50"
                    }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.title} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 self-start max-w-[520px] aspect-[4.5/5] relative overflow-hidden bg-[#e5e5e5]">
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt={selectedImage.altText || product.title}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* Column 3: Product Info — normal flow, scrolls with the page while
            the image column beside it stays sticky/pinned. */}
        <div className="  py-8 px-4 pr-10 lg:pr-40 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-2 mt-2">
            <h1 className="text-[20px] lg:text-[28px] leading-tight font-sans font-semibold italic text-black max-w-[85%]">
              {product.title}
            </h1>
            {/* <button aria-label="Save product" className="text-gray-400 hover:text-black transition-colors mt-2">
               <Bookmark size={24} />
             </button> */}
          </div>

          <div className="flex items-center font-inter gap-3 mt-2">
            {formattedComparePrice && (
              <p className="text-[22px] text-gray-500 line-through decoration-[1.5px]">{formattedComparePrice}</p>
            )}
            <p className="text-[22px] text-[#2a2a2a]">{formattedPrice}</p>
          </div>
          <p className="text-[11px] text-gray-400 mb-1">(MRP inclusive of all taxes)</p>

          <div className="">
            <ProductRatingBadge productId={product.id} />
          </div>

          {(safeDescriptionHtml || product.description) && (
            <div className="text-[15px] font-inter text-black leading-relaxed prose prose-sm max-w-none">
              {safeDescriptionHtml ? (
                <div dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }} />
              ) : (
                <p>{product.description}</p>
              )}
            </div>
          )}

          <ProductForAndSize product={product} />

          <UpgradeYourRoutineCarousel products={relatedProducts} />

          {/* Quantity Selector */}
          <div className="flex flex-col gap-3 mb-8">
            <span className="text-[11px] font-inter font-bold tracking-[0.15em] text-black uppercase">Quantity</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center w-32 border-2 border-black bg-white/50 backdrop-blur-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#B40417]  hover:bg-[#B40417]/5 transition-colors"
                >
                  −
                </button>
                <div className="flex-1 text-center text-sm font-semibold text-[#B40417]">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={isOutOfStock || quantity >= maxQuantity}
                  className="w-10 h-10 flex items-center justify-center text-[#B40417] font-semibold hover:bg-[#B40417]/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleShare}
                className="text-[12px] uppercase tracking-widest font-inter font-semibold px-6 py-3 border-2 border-black hover:bg-[#B40417]/5 transition-colors h-10 flex items-center justify-center bg-white/50 backdrop-blur-sm text-[#B40417]"
              >
                Share
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mb-12 w-full">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-100 border border-gray-200 text-gray-400 rounded-[8px] py-4 text-[11px] font-bold tracking-[0.15em] uppercase font-inter cursor-not-allowed"
              >
                OUT OF STOCK
              </button>
            ) : (
              <>
                <button
                  onClick={() => variantId && addItem(variantId, quantity)}
                  className="w-full bg-[#B40417] border border-[#B40417] text-white py-4 text-[12px] font-semibold tracking-[0.15em] uppercase hover:bg-[#B40417]/80 hover:text-white transition-all duration-300 font-inter shadow-sm"
                >
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-white border-2 border-[#B40417] text-[#B40417]  py-4 text-[12px] font-semibold tracking-[0.15em] uppercase hover:bg-[#B40417] hover:text-white transition-all duration-500 font-inter shadow-xl shadow-[#B40417]/10"
                >
                  BUY NOW
                </button>
              </>
            )}
          </div>

          <ProductAccordionGroup product={product} />
        </div>
      </div>

      {/* Mobile view fallback: Stacked gallery moved to slider */}
      <div className="md:hidden flex flex-col p-4 gap-2 pt-25">
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
              <div key={idx} className="w-full shrink-0 snap-center">
                <div className="w-full aspect-[4/5] relative overflow-hidden bg-[#e5e5e5]">
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
            <div className="flex justify-center gap-3 mt-8">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 w-2.5 transition-all duration-300 ${idx === mobileImageIndex ? "bg-[#B40417]" : "bg-[#B40417]/20"
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col mb-2 mt-4">
          <div className="flex justify-between items-start">
            <h1 className="text-[24px] leading-tight font-sans font-medium text-black max-w-[85%]">{product.title}</h1>
            {/* <button aria-label="Save product" className="text-gray-400 hover:text-black transition-colors mt-2">
               <Bookmark size={24} />
             </button> */}
          </div>
          <div className="flex items-center gap-3 mt-5">
            <p className="text-[18px] text-gray-500 line-through decoration-[1.5px]">{formattedComparePrice}</p>
            {formattedComparePrice && (
              <p className="text-[22px] font-semibold text-black">{formattedPrice}</p>
            )}
          </div>
          <p className="text-[12px] text-gray-400 ">(MRP Inclusive of all Taxes)</p>
          <ProductRatingBadge productId={product.id} />
        </div>

        {(safeDescriptionHtml || product.description) && (
          <div className="text-[16px] text-black leading-relaxed prose prose-sm font-medium max-w-none">
            {safeDescriptionHtml ? (
              <div dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }} />
            ) : (
              <p>{product.description}</p>
            )}
          </div>
        )}

        <ProductForAndSize product={product} />

        <UpgradeYourRoutineCarousel products={relatedProducts} />

        {/* Quantity Selector Mobile */}
        <div className="flex flex-col gap-1 mb-2">
          <span className="text-[11px] font-bold tracking-[0.15em] text-black uppercase">Quantity</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center w-32 border-2 border-black bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center font-semibold text-black"
              >
                −
              </button>
              <div className="flex-1 text-center font-semibold text-[#B40417]">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={isOutOfStock || quantity >= maxQuantity}
                className="w-12 h-12 flex items-center justify-center font-semibold text-black disabled:opacity-30"
              >
                +
              </button>
            </div>
            <button
              onClick={handleShare}
              className="text-[10px] uppercase tracking-widest font-semibold px-6 py-3 border-2 border-black hover:bg-black/20 hover:text-white transition-colors h-12 flex items-center justify-center text-black"
            >
              Share
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 w-full">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full bg-gray-100 border border-gray-200 text-gray-400 rounded-[8px] py-4 text-[11px] font-bold tracking-[0.15em] uppercase font-inter cursor-not-allowed"
            >
              OUT OF STOCK
            </button>
          ) : (
            <>
              <button
                onClick={() => variantId && addItem(variantId, quantity)}
                className="w-full bg-[#B40417] border-2 border-[#B40417] text-white py-4 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-white hover:text-[#B40417] transition-all duration-300 font-inter shadow-sm"
              >
                ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-white border-2 border-[#B40417] text-[#B40417] py-4 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-[#B40417] hover:text-white transition-all duration-500 font-inter shadow-xl shadow-[#B40417]/10"
              >
                BUY NOW
              </button>
            </>
          )}
        </div>

        <ProductAccordionGroup product={product} />
      </div>


      {/* Crowd Favourites */}
      {productGridSection}

      {/* Judge.me Reviews Section
      <div className="max-w-[1500px] mx-auto w-full md:grid md:grid-cols-[1.8fr_1.2fr] gap-0 px-4 sm:px-10 lg:px-16 pb-12">
        <div className="w-full relative col-span-1 md:col-start-1 md:pr-10 lg:pr-5">
          <ReviewSection productId={product.id} />
        </div>
      </div> */}

      {/* Hardcoded Featured Testimonials */}
      <TestimonialSection />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16 py-4 border-t border-[#e5e5e5]/30">
          <div className="flex flex-col items-center text-center mb-8 md:mb-16 gap-3 md:gap-5 mt-4 md:mt-12">
            <h2 className="text-4xl md:text-5xl text-black font-inter uppercase">
              Complete{" "}
              <span className="relative z-0 inline-block font-semibold italic px-1">
                <span className="absolute bottom-1 left-0 right-0 h-[38%] bg-[#F7E5B5] -z-10" />
                your Ritual
              </span>
            </h2>
          </div>

          {/* Mobile: Horizontal Carousel | Desktop: 4-Column Grid */}
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 md:gap-8 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {relatedProducts.slice(0, 4).map((relProduct) => (
              <div key={relProduct.id} className="min-w-[75vw] sm:min-w-[45vw] md:min-w-0 snap-center">
                <ProductCard product={relProduct} />
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Judge.me Reviews Section */}
      <div className="max-w-[1500px] mx-auto w-full md:grid md:grid-cols-[1.8fr_1.2fr] gap-0 px-4 sm:px-10 lg:px-16 pb-12 py-10" >
        <div className="w-full relative col-span-1 md:col-start-1 md:pr-10 lg:pr-5">
          <ReviewSection productId={product.id} />
        </div>
      </div>
    </div>
  );
}
