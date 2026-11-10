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
  getProductSkinTypes,
  getProductNetQuantity,
  getProductSize,
  getProductSizeOptions,
} from "@/lib/shopify";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo, ReactNode, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDown, Check, Truck, Clock, Banknote, Share2, Lock, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchRating } from "@/lib/reviewsClient";
import ProductSlider from "@/app/components/ProductSlider";
import { useCart } from "@/app/context/CartContext";
import ReviewSection from "@/app/components/ReviewSection";
import ProductRatingBadge from "@/app/components/ProductRatingBadge";
import TestimonialSection from "@/app/components/TestimonialSection";
import { getProductFaqs } from "@/app/components/ProductFaqSection";
import { pixelViewContent } from "@/lib/pixel";
import { publishProductViewed } from "@/lib/shopifyAnalytics";
import { triggerGokwikCheckout } from "@/lib/gokwik";

const PRODUCT_BASE_PATH = "/products";

// Packs of 1-3 are the quantity selector, shown as cards.
const PACK_SIZES = [1, 2, 3];

// Discount and badge shown on each pack card.
// Re-enable these once matching Shopify Automatic Discounts exist (e.g. 10% off for qty ≥ 2,
// 15% off for qty ≥ 3). Until then keep this empty so the page and cart always agree.
const PACK_OFFERS: Record<number, { percent?: number; badge?: string }> = {
  2: { percent: 5, badge: "Most Popular" },
  3: { percent: 10, badge: "Best Value" },
};

// Total for a pack after its discount, in whole rupees (the same rounding the cards show).
const packTotalFor = (unitPrice: number, pack: number) =>
  Math.round(unitPrice * pack * (1 - (PACK_OFFERS[pack]?.percent ?? 0) / 100));

// Claims shown under "Upgrade your routine" on every product page, so each must be true for the whole range.
const PRODUCT_CLAIMS = ["Sulphate free", "Paraben free", "Cruelty free", "Ethically sourced", "Made in India"];

// Same address as the Contact page.
const CONTACT_EMAIL = "care@indevie.com";

// Content of the pack, e.g. "100 ml", used for the cost-per-100-ml line. Shopify's custom.net_quantity wins;
// otherwise the Size field is used when it states an amount ("100ml", "50 g").
const AMOUNT_PATTERN = /\d+(?:\.\d+)?\s*(?:ml|gms?|g)\b/i;

const resolveNetQuantity = (product: ShopifyProduct) => {
  const netQuantity = getProductNetQuantity(product);
  if (netQuantity) return netQuantity;
  const size = getProductSize(product);
  return size && AMOUNT_PATTERN.test(size) ? size : null;
};

// Same amount written two ways ("100ml" / "100 ml") counts as one.
const sameText = (a: string | null, b: string | null) =>
  !!a && !!b && a.replace(/\s+/g, "").toLowerCase() === b.replace(/\s+/g, "").toLowerCase();

// Simplified card-network marks (drawn in SVG, no external files). Swap in the official logo files
// from each network's brand centre if you want the exact artwork.
function VisaLogo() {
  return (
    <svg viewBox="0 0 52 32" role="img" aria-label="Visa" className="h-6 w-auto rounded-md">
      <rect width="52" height="32" rx="6" fill="#1434CB" />
      <text
        x="26"
        y="22"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="17"
        letterSpacing="-0.5"
        fill="#ffffff"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 52 32" role="img" aria-label="Mastercard" className="h-6 w-auto rounded-md">
      <rect width="52" height="32" rx="6" fill="#1a1a1a" />
      <circle cx="20" cy="16" r="9" fill="#EB001B" />
      <circle cx="32" cy="16" r="9" fill="#F79E1B" />
      <path d="M26 9.29 A9 9 0 0 1 26 22.71 A9 9 0 0 1 26 9.29 Z" fill="#FF5F00" />
    </svg>
  );
}

function RupayLogo() {
  return (
    <svg viewBox="0 0 52 32" role="img" aria-label="RuPay" className="h-6 w-auto rounded-md border border-black/15 bg-white">
      <text
        x="4"
        y="20"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="13"
        fill="#1a3d8f"
      >
        Ru<tspan fill="#f26522">Pay</tspan>
      </text>
      <polygon points="42,9 49,16 42,23" fill="#f26522" />
      <polygon points="45,12 49,16 45,20" fill="#00a651" />
    </svg>
  );
}

// Prepaid-order offer line under the payment methods. Display only: it must match a discount that is
// really applied at GoKwik checkout for online payments. Set to null to hide the line.
const PREPAID_OFFER: { percent: number; maxAmount: number } | null = { percent: 5, maxAmount: 100 };

// Payment methods shown under the buttons. Keep in step with what the GoKwik checkout really offers.
const PAYMENT_METHODS: { label: string; logo?: ReactNode }[] = [
  { label: "UPI" },
  { label: "Visa", logo: <VisaLogo /> },
  { label: "Mastercard", logo: <MastercardLogo /> },
  { label: "RuPay", logo: <RupayLogo /> },
  { label: "Net Banking" },
  { label: "Wallets" },
  { label: "Cash On Delivery" },
];

const formatInr = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Net content like "100 ml" / "50g" -> price per 100 ml / 100 g. Anything else has no unit price.
function pricePerHundred(unitPrice: number, size: string | null) {
  const match = size?.match(/(\d+(?:\.\d+)?)\s*(ml|gms?|g)\b/i);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  if (!amount) return null;
  return {
    price: (unitPrice / amount) * 100,
    unit: match[2].toLowerCase().startsWith("m") ? "ml" : "g",
  };
}

const LABEL_CLASS = "text-[11px] font-inter font-bold tracking-[0.15em] text-black/60 uppercase";

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
              <div key={faq.question || i}>
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
function RichTextAccordionRow({
  title,
  html,
  scrollable = false,
}: {
  title: string;
  html: string | null;
  scrollable?: boolean;
}) {
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
          className={`px-6 pb-6 text-[15px] font-inter font-semibold text-[#2a2a2a] marker:text-[#6c3518] animate-in fade-in duration-200 ${scrollable ? "max-h-[320px] overflow-y-auto" : ""
            }`}
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
      <RichTextAccordionRow title="Ingredients" html={ingredientsHtml} scrollable />
      <RichTextAccordionRow title="How To Use" html={howToUseHtml} />
      <RichTextAccordionRow title="Inside The Box" html={insideTheBoxHtml} />
      <FaqAccordionRow faqs={faqs} />
      <RichTextAccordionRow title="Additional Information" html={additionalInfoHtml} />
    </div>
  );
}

// Type (custom.skin_type), size (custom.size / custom.size_options), net content and "Helps with"
// (custom.concern) — all sourced from real Shopify metafields. Each part disappears on its own if
// the product has no data for it.
const PILL_CLASS =
  "inline-flex items-center gap-1.5 rounded-full bg-[#B40417]/10 px-4 py-2 font-inter text-[14px] leading-none font-medium text-[#2a2a2a]";

function ProductSizeAndConcerns({ product }: { product: ShopifyProduct }) {
  const concerns = getProductConcerns(product);
  const types = getProductSkinTypes(product);
  const netQuantity = resolveNetQuantity(product);
  const size = getProductSize(product);
  // custom.size_options links this product to its sibling sizes (e.g. Full
  // Size <-> Travel Size, each a separate Shopify product). When it's set,
  // the size becomes a switcher between those real products instead of a
  // static label -- clicking a size that isn't the current product navigates
  // to that product's own page.
  const sizeOptions = getProductSizeOptions(product);

  if (concerns.length === 0 && types.length === 0 && !size && !netQuantity) return null;

  // Build the net content options list:
  // • If size_options metafield is populated → show all sibling sizes as cards
  //   (the current product's card is highlighted, others are links to their pages).
  // • If only a single size label exists → show it as a single selected card.
  // • Otherwise fall back to the netQuantity pill in the type row.
  const hasMultipleSizes = sizeOptions.length > 1;
  const hasSingleSize = !hasMultipleSizes && !!size;

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Hair / skin type + net content (single-size, no switcher) pills row */}
      {(types.length > 0 || (hasSingleSize && !hasMultipleSizes)) && (
        <div className="flex flex-wrap items-center gap-2">
          {types.map((type) => (
            <span key={type} className={PILL_CLASS}>
              {type}
            </span>
          ))}
          {hasSingleSize && (
            <span className={PILL_CLASS}>{size}</span>
          )}
          {netQuantity && !sameText(netQuantity, size) && (
            <span className={PILL_CLASS}>{netQuantity}</span>
          )}
        </div>
      )}

      {/* Choose Net Content — prominent card switcher shown when multiple size options exist */}
      {hasMultipleSizes && (
        <div className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Choose Net Content</span>
          <div className="flex gap-2 flex-wrap">
            {sizeOptions.map((opt) => {
              const isCurrent = opt.handle === product.handle;
              return isCurrent ? (
                <span
                  key={opt.handle}
                  aria-current="true"
                  className="relative flex flex-col items-center justify-center gap-0.5 px-5 py-3 min-w-[88px] min-h-[64px] border border-[#B40417] ring-1 ring-[#B40417] bg-[#B40417]/[0.06] font-inter"
                >
                  <span className="text-[10px] font-semibold text-[#B40417] uppercase tracking-widest">Selected</span>
                  <span className="text-[16px] font-bold text-black leading-tight">{opt.size}</span>
                </span>
              ) : (
                <Link
                  key={opt.handle}
                  href={`${PRODUCT_BASE_PATH}/${opt.handle}`}
                  className="relative flex flex-col items-center justify-center gap-0.5 px-5 py-3 min-w-[88px] min-h-[64px] border border-black/20 bg-white hover:border-[#B40417] hover:ring-1 hover:ring-[#B40417] hover:bg-[#B40417]/[0.03] transition-all font-inter"
                >
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Try Me</span>
                  <span className="text-[16px] font-bold text-black leading-tight">{opt.size}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Helps With */}
      {concerns.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Helps with</span>
          <div className="flex flex-wrap gap-2">
            {concerns.map((concern) => (
              <span key={concern} className={PILL_CLASS}>
                <Check size={14} className="text-[#B40417] shrink-0" strokeWidth={3} />
                {concern}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Real Judge.me rating pill laid over the first mobile photo; renders nothing for a product with no reviews.
function MobileRatingPill({ productId }: { productId: string }) {
  const [rating, setRating] = useState<{ averageRating: number; total: number } | null>(null);
  const externalId = productId.split("/").pop();

  useEffect(() => {
    if (!externalId) return;
    fetchRating(externalId)
      .then((data) => setRating({ averageRating: data.averageRating || 0, total: data.total || 0 }))
      .catch(() => { });
  }, [externalId]);

  if (!rating || rating.total === 0) return null;

  return (
    <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] leading-none font-medium text-[#2a2a2a] shadow-sm font-inter">
      <Star size={12} className="fill-[#B40417] text-[#B40417]" />
      {rating.averageRating.toFixed(1)} · {rating.total} {rating.total === 1 ? "review" : "reviews"}
    </span>
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
    <div className="mb-3 min-w-0">
      <h3 className="text-[20px] font-inter font-bold text-[#2a2a2a] mb-2.5">Upgrade your routine</h3>
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
              className="w-[300px] sm:w-[320px] shrink-0 flex items-center gap-3 border-2 border-black p-3"
            >
              <Link
                href={`${PRODUCT_BASE_PATH}/${p.handle}`}
                className="block w-24 h-24 shrink-0 relative overflow-hidden bg-[#e5e5e5]"
              >
                {image && (
                  <Image src={image.url} alt={image.altText || p.title} fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-col gap-1.5 min-w-0">
                <Link
                  href={`${PRODUCT_BASE_PATH}/${p.handle}`}
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
  const [showStickyBar, setShowStickyBar] = useState(true);
  const { addItem, isUpdating } = useCart();
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileImageIndex(0);
    setSelectedImageIndex(0);
  }, [product.handle]);

  const scrollMobileTo = (index: number) => {
    if (mobileSliderRef.current) {
      const width = mobileSliderRef.current.clientWidth;
      mobileSliderRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
      setMobileImageIndex(index);
    }
  };

  const handleMobilePrev = () => {
    if (product.images?.nodes?.length && product.images.nodes.length > 1) {
      const total = product.images.nodes.length;
      const newIndex = mobileImageIndex > 0 ? mobileImageIndex - 1 : total - 1;
      scrollMobileTo(newIndex);
    }
  };

  const handleMobileNext = () => {
    if (product.images?.nodes?.length && product.images.nodes.length > 1) {
      const total = product.images.nodes.length;
      const newIndex = mobileImageIndex < total - 1 ? mobileImageIndex + 1 : 0;
      scrollMobileTo(newIndex);
    }
  };

  // No variant picker UI -- always the product's first (and typically only
  // purchasable) variant.
  const selectedVariant = product.variants?.nodes[0];
  const primaryVariantId = selectedVariant?.id;

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
  }, [product.id, product.title, primaryVariantId]);

  // Shopify Analytics product view (the page view itself is sent by <ShopifyAnalytics />)
  useEffect(() => {
    const variant = product.variants?.nodes[0];
    if (!variant?.price) return;
    publishProductViewed({
      id: product.id,
      title: product.title,
      vendor: product.vendor || "",
      productType: product.productType || undefined,
      variantId: variant.id,
      variantTitle: variant.title || "",
      price: { amount: variant.price.amount, currencyCode: variant.price.currencyCode },
    });
  }, [product.id, product.title, product.vendor, product.productType, primaryVariantId]);

  const images = product.images?.nodes || [];

  // Sanitize merchant-authored HTML before rendering — descriptions come from
  // Shopify admin, but a compromised/misused admin account or pasted rich text
  // could otherwise inject executable markup into every visitor's browser.
  const safeDescriptionHtml = useMemo(
    () => (product.descriptionHtml ? DOMPurify.sanitize(product.descriptionHtml) : ""),
    [product.descriptionHtml]
  );

  const selectedImage = images[selectedImageIndex] || images[0];

  const variantId = selectedVariant?.id;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const unitPrice = price ? parseFloat(price.amount) : null;
  const unitComparePrice =
    compareAtPrice && unitPrice !== null && parseFloat(compareAtPrice.amount) > unitPrice
      ? parseFloat(compareAtPrice.amount)
      : null;

  const packPrice = unitPrice !== null ? packTotalFor(unitPrice, quantity) : null;
  // Struck-through price: the product's compare-at price, or its normal price when only a pack discount applies.
  const packComparePrice =
    unitComparePrice !== null
      ? Math.round(unitComparePrice * quantity)
      : unitPrice !== null && PACK_OFFERS[quantity]
        ? Math.round(unitPrice * quantity)
        : null;
  const packSavings =
    packPrice !== null && packComparePrice !== null && packComparePrice > packPrice
      ? packComparePrice - packPrice
      : null;
  const perHundred =
    packPrice !== null ? pricePerHundred(packPrice / quantity, resolveNetQuantity(product)) : null;

  const { isOutOfStock, maxQuantity } = getStockInfo(selectedVariant);

  // Keep the quantity selector from ever sitting above the real cap (e.g. if
  // the merchant lowers stock while this page is already open)
  useEffect(() => {
    setQuantity((q) => Math.max(1, Math.min(q, maxQuantity)));
  }, [maxQuantity]);

  // Sticky buy bar: fixed to the bottom from the moment the page loads; it only steps aside
  // while the footer is on screen so it never covers the footer links.
  useEffect(() => {
    // One layout read per scroll event; React skips the re-render while the value is unchanged.
    const update = () => {
      const footer = document.querySelector("footer");
      setShowStickyBar(!footer || footer.getBoundingClientRect().top >= window.innerHeight);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleBuyNow = async () => {
    if (isUpdating || !variantId || isOutOfStock) return;
    const updatedCart = await addItem(variantId, quantity);
    if (updatedCart?.id) {
      const opened = triggerGokwikCheckout(updatedCart.id);
      if (!opened) {
        alert("Checkout is still loading — please try again in a moment.");
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
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy link."));
    }
  };

  return (
    <div className="w-full bg-[#ffffff] min-h-screen">
      <div className="max-w-[1500px] mx-auto w-full relative md:grid md:grid-cols-[1.3fr_1.2fr] gap-0 pt-25 md:pt-42 pb-12 md:pb-20">

        {/* Desktop: thumbnail rail + single large image — sticky so it stays pinned
            while the (usually taller) info column scrolls past it normally,
            releasing once the info column's content is exhausted. */}
        <div className="hidden md:flex pl-10 lg:pl-40 pr-2 gap-3 self-start sticky top-32">
          {images.length > 1 && (
            // The rail is exactly as tall as the main image beside it (absolute
            // inside a stretched wrapper), and scrolls when there are more
            // thumbnails than fit.
            <div className="relative w-25 shrink-0">
              <div
                className="absolute inset-0 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden"
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
            </div>
          )}
          <div className="flex-1 self-start max-w-[520px] aspect-[4/5] relative overflow-hidden bg-[#e5e5e5]">
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

        {/* Mobile: swipeable gallery */}
        <div className="md:hidden relative group">
          {/* Rating shows on the first photo only; the counter stays on every photo. */}
          {mobileImageIndex === 0 && <MobileRatingPill productId={product.id} />}
          {images.length > 1 && (
            <span className="absolute top-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1.5 text-[12px] leading-none font-semibold text-white font-inter">
              {mobileImageIndex + 1} / {images.length}
            </span>
          )}

          <div
            ref={mobileSliderRef}
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

          {/* Mobile Slider Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handleMobilePrev}
                aria-label="Previous image"
                className="absolute left-2 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 text-black shadow-md flex items-center justify-center active:scale-90 transition-transform"
              >
                <ChevronLeft size={20} className="stroke-[2.2]" />
              </button>
              <button
                onClick={handleMobileNext}
                aria-label="Next image"
                className="absolute right-2 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 text-black shadow-md flex items-center justify-center active:scale-90 transition-transform"
              >
                <ChevronRight size={20} className="stroke-[2.2]" />
              </button>
            </>
          )}
        </div>

        {/* Product info — one panel for every screen size. Normal flow, so it
            scrolls with the page while the desktop image column stays pinned. */}
        <div className="px-4 py-6 md:-mt-10 md:pt-0 md:pb-8 md:pr-10 lg:pr-40 flex flex-col min-w-0 font-inter">
          {/* Mobile only: square page markers for the photo slider, above the rating. */}
          {images.length > 1 && (
            <div className="md:hidden flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-5" role="tablist" aria-label="Product photos">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === mobileImageIndex}
                  aria-label={`Go to photo ${idx + 1}`}
                  onClick={() => scrollMobileTo(idx)}
                  className={`w-2.5 h-2.5 rounded-full border border-black transition-colors ${idx === mobileImageIndex ? "bg-black" : "bg-transparent"
                    }`}
                />
              ))}
            </div>
          )}

          <div className="mb-1 min-h-[24px]">
            <ProductRatingBadge productId={product.id} />
          </div>

          <div className="flex justify-between items-start gap-4 mb-1.5">
            <h1 className="text-[24px] md:text-[32px] lg:text-[36px] leading-tight font-sans font-semibold italic text-black uppercase">
              {product.title}
            </h1>
            <button
              onClick={handleShare}
              aria-label="Share this product"
              className="mt-1.5 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-black text-[#B40417] hover:bg-[#B40417] hover:text-white hover:border-[#B40417] transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>

          {(safeDescriptionHtml || product.description) && (
            // The first/last element's own margins are zeroed so the gap above and below is only the spacing set here.
            <div className="text-[15px] text-black leading-relaxed prose prose-sm max-w-none mb-2.5 [&_:first-child]:mt-0 [&_:last-child]:mb-0">
              {safeDescriptionHtml ? (
                <div dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }} />
              ) : (
                <p>{product.description}</p>
              )}
            </div>
          )}

          <ProductSizeAndConcerns product={product} />

          {/* Choose a pack — each pack is simply that many units; the price shown is the real
              price x units, with no invented bundle discount. */}
          {!isOutOfStock && unitPrice !== null && (
            <div className="flex flex-col gap-1.5 mb-3">
              <span className={LABEL_CLASS}>Choose a pack</span>
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {PACK_SIZES.map((pack) => {
                  const selected = pack === quantity;
                  const unavailable = pack > maxQuantity;
                  const offer = PACK_OFFERS[pack];
                  const total = packTotalFor(unitPrice, pack);
                  return (
                    <button
                      key={pack}
                      type="button"
                      onClick={() => setQuantity(pack)}
                      disabled={unavailable}
                      aria-pressed={selected}
                      className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-3.5 min-h-[100px] border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selected
                        ? "border-2 border-[#B40417] bg-[#B40417]/[0.05] shadow-xs"
                        : "border border-black/15 bg-white hover:border-black/40"
                        }`}
                    >
                      {offer?.badge && (
                        <span className="absolute rounded-full -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#B40417] px-3 py-0.5 text-[11px] leading-tight font-semibold text-white shadow-xs">
                          {offer.badge}
                        </span>
                      )}
                      <span className="text-[13px] font-medium text-[#2a2a2a]">Pack of {pack}</span>
                      <span className="text-[18px] sm:text-[20px] font-bold text-black leading-tight mt-0.5">{formatInr(total)}</span>
                      <span className="text-[11.5px] text-gray-500 mt-0.5">{formatInr(Math.round(total / pack))} each</span>
                      {offer?.percent ? (
                        <span className="text-[11.5px] font-semibold text-[#B40417] mt-0.5">Save {offer.percent}%</span>
                      ) : (
                        <span className="text-[11.5px] invisible select-none mt-0.5" aria-hidden="true">Save 0%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mb-3.5">
            <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
              <span className="text-[22px] sm:text-[24px] leading-none font-bold text-black">
                {packPrice !== null ? formatInr(packPrice) : "N/A"}
              </span>
              {packComparePrice !== null && (
                <span className="text-[16px] sm:text-[17px] leading-none text-[#666666] line-through decoration-1">
                  {formatInr(packComparePrice)}
                </span>
              )}
              {packSavings !== null && (
                <span className="bg-[#B40417] px-3 py-1.5 text-[12px] leading-none rounded-full font-poppins font-semibold text-white">
                  You save {formatInr(packSavings)}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] text-gray-500">
              MRP inclusive of all taxes
              {perHundred && ` · ${formatInr(Math.round(perHundred.price))} per 100 ${perHundred.unit}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-2 mb-3.5 w-full">
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
                  onClick={() => !isUpdating && variantId && addItem(variantId, quantity)}
                  disabled={isUpdating}
                  className="flex-1 min-w-0 bg-[#B40417] border border-[#B40417] text-white py-4 px-2 text-[14px] font-semibold tracking-[0.15em] uppercase whitespace-nowrap hover:bg-[#B40417]/80 hover:text-white transition-all duration-300 font-inter shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? "ADDING..." : "ADD TO CART"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isUpdating}
                  className="flex-1 min-w-0 bg-white border-2 border-[#B40417] text-[#B40417] py-4 px-2 text-[14px] font-semibold tracking-[0.15em] uppercase whitespace-nowrap hover:bg-[#B40417] hover:text-white transition-all duration-500 font-inter shadow-xl shadow-[#B40417]/10 disabled:opacity-50"
                >
                  BUY NOW
                </button>
              </>
            )}
          </div>

          {/* Payment methods offered at checkout */}
          <div className="mb-2.5">
            <p className="flex items-center gap-2 text-[12px] text-gray-500 mb-1.5">
              <Lock size={12} className="shrink-0" />
              Secure checkout. Pay your way:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map(({ label, logo }) =>
                logo ? (
                  <span key={label} className="flex items-center">
                    {logo}
                  </span>
                ) : (
                  <span
                    key={label}
                    className="flex items-center px-2.5 h-6 rounded-md border border-black/15 bg-white text-[12px] font-medium text-[#2a2a2a]"
                  >
                    {label}
                  </span>
                )
              )}
            </div>
            {PREPAID_OFFER && (
              <p className="mt-2 text-[14px] font-medium text-[#B40417]">
                Pay online & save up to ₹{PREPAID_OFFER.maxAmount}! Skip COD and enjoy {PREPAID_OFFER.percent}% extra savings
              </p>
            )}
          </div>

          {/* Delivery facts — shipping lines follow the Shipping Policy page */}
          <ul className="flex flex-col gap-1.5 mb-3 text-[13.5px] text-[#2a2a2a]">
            <li className="flex items-start gap-2.5">
              <Truck size={17} className="text-[#B40417] shrink-0 mt-0.5" />
              Free shipping across India: 3 to 5 days in metro cities, 6 to 10 days for remote pincodes
            </li>
            <li className="flex items-start gap-2.5">
              <Banknote size={17} className="text-[#B40417] shrink-0 mt-0.5" />
              Cash on delivery available
            </li>
            <li className="flex items-start gap-2.5">
              <Clock size={17} className="text-[#B40417] shrink-0 mt-0.5" />
              Dispatched within 1–2 business days
            </li>
            <li className="flex items-start gap-2.5">
              <Truck size={17} className="text-[#B40417] shrink-0 mt-0.5" />
              Tracking link sent by email, SMS or WhatsApp
            </li>
          </ul>

          <UpgradeYourRoutineCarousel products={relatedProducts} />

          {/* Brand claims + contact line */}
          <div className="mb-3 flex flex-col gap-1 font-inter">
            <p className="text-[13px] text-gray-500">{PRODUCT_CLAIMS.join(" · ")}</p>
            <p className="text-[14px] text-black">
              Questions before you buy?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-[#B40417] transition-colors">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <ProductAccordionGroup product={product} />
        </div>
      </div>

      {/* Crowd Favourites */}
      {productGridSection}

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

          <ProductSlider products={relatedProducts} />
        </section>
      )}

      {/* Judge.me Reviews Section */}
      <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-10 lg:px-16 pb-12 py-10">
        <ReviewSection productId={product.id} />
      </div>

      {/* Sticky buy bar */}
      {!isOutOfStock && (
        <div
          aria-hidden={!showStickyBar}
          className={`fixed bottom-0 inset-x-0 z-[900] bg-[#B40417] text-white transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
            }`}
        >
          <div className="max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 font-inter">
              <p className="text-[13px] sm:text-[14px] font-medium truncate">{product.title}</p>
              <p className="text-[15px] sm:text-[16px] leading-tight">
                <span className="font-bold">{packPrice !== null ? formatInr(packPrice) : ""}</span>
                {packComparePrice !== null && (
                  <span className="ml-2 text-[12px] sm:text-[13px] text-white/70 line-through">
                    {formatInr(packComparePrice)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => !isUpdating && variantId && addItem(variantId, quantity)}
                disabled={isUpdating}
                tabIndex={showStickyBar ? 0 : -1}
                className="rounded-full bg-white border border-white text-[#B40417] uppercase px-4 sm:px-6 py-2.5 text-[12px] sm:text-[14px] font-semibold hover:bg-white/90 transition-colors font-inter whitespace-nowrap disabled:opacity-50"
              >
                {isUpdating ? "Adding..." : "Add to cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isUpdating}
                tabIndex={showStickyBar ? 0 : -1}
                className="rounded-full border border-white text-white uppercase px-4 sm:px-6 py-2.5 text-[13px] sm:text-[15px] font-semibold hover:bg-white hover:text-[#B40417] transition-colors font-inter whitespace-nowrap disabled:opacity-50"
              >
                Buy it now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
