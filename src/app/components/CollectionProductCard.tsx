"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, Plus, Minus } from "lucide-react";
import { ShopifyProduct } from "@/lib/shopify";
import { useCart } from "../context/CartContext";

interface CollectionProductCardProps {
  product: ShopifyProduct;
  priority?: boolean;
}

export default function CollectionProductCard({ product, priority = false }: CollectionProductCardProps) {
  const { cart, addItem, updateQuantity, removeItem, isUpdating } = useCart();
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const variantId = product?.variants?.nodes[0]?.id;
  const price = product?.variants?.nodes[0]?.price;
  const compareAtPrice = product?.variants?.nodes[0]?.compareAtPrice;
  const images = product?.images?.nodes || [];
  const mainImage = images[0];

  // Extract external ID for reviews
  const externalId = product.id.split("/").pop();

  useEffect(() => {
    if (!externalId) return;

    fetch(`/api/reviews?productId=${externalId}`)
      .then((res) => res.json())
      .then((data) => {
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.total || 0);
      })
      .catch((err) => console.error("Failed to fetch card rating:", err));
  }, [externalId]);

  // Find if this product (or variant) is currently in the cart
  const lineItem = cart?.lines?.nodes?.find(
    (line: any) => line.merchandise.id === variantId
  );
  const quantityInCart = lineItem ? lineItem.quantity : 0;
  const lineId = lineItem ? lineItem.id : null;

  // Formatting prices
  const formattedPrice = price
    ? `₹${parseFloat(price.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "N/A";

  const formattedComparePrice = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || "0")
    ? `₹${parseFloat(compareAtPrice.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : null;

  // Extract badges & banners from tags, or use smart fallbacks
  const tags = product.tags || [];
  
  // 1. Badge matching
  let badgeText = "";
  const customBadgeTag = tags.find(t => t.toLowerCase().startsWith("badge:"));
  if (customBadgeTag) {
    badgeText = customBadgeTag.split(":")[1].toUpperCase();
  } else if (tags.some(t => t.toLowerCase().includes("bestseller"))) {
    badgeText = "BESTSELLER";
  } else if (tags.some(t => t.toLowerCase().includes("hot drop") || t.toLowerCase().includes("popular"))) {
    badgeText = "HOT DROP";
  } else if (tags.some(t => t.toLowerCase().includes("new"))) {
    badgeText = "NEW LAUNCH";
  } else {
    // Smart defaults based on title / handle
    const titleLower = product.title.toLowerCase();
    if (titleLower.includes("mist")) badgeText = "BESTSELLER";
    else if (titleLower.includes("sunshield") || titleLower.includes("sunscreen")) badgeText = "HOT DROP";
    else if (titleLower.includes("calm balm")) badgeText = "MOST RE-ORDERED";
    else if (titleLower.includes("lotion")) badgeText = "NEW LAUNCH";
    else if (titleLower.includes("set") || titleLower.includes("ritual")) badgeText = "GIFT EXCLUSIVE";
  }

  // 2. Banner matching
  let bannerText = "";
  const customBannerTag = tags.find(t => t.toLowerCase().startsWith("banner:"));
  if (customBannerTag) {
    bannerText = customBannerTag.split(":")[1].toUpperCase();
  } else {
    // Smart defaults based on title / handle
    const titleLower = product.title.toLowerCase();
    if (titleLower.includes("geeli mitti")) bannerText = "CLAY FACE RITUAL";
    else if (titleLower.includes("gulkand")) bannerText = "ROSE PETAL MIST";
    else if (titleLower.includes("sunshield") || titleLower.includes("sunscreen")) bannerText = "AYURVEDIC SPF 50";
    else if (titleLower.includes("calm balm")) bannerText = "SOOTHING SKIN RITUAL";
    else if (titleLower.includes("lotion")) bannerText = "DAILY BODY NOURISHMENT";
    else if (titleLower.includes("maalish")) bannerText = "GLOWING BODY OIL";
    else if (titleLower.includes("set") || titleLower.includes("ritual")) bannerText = "ULTIMATE SKIN RITUAL";
    else bannerText = "GENURVEDA™ APPROVED";
  }

  // 3. Subtitle / snippet description
  let subtitle = "";
  if (product.description) {
    // Get the first sentence of the description as subtitle
    const sentences = product.description.split(/[.!?]+/);
    subtitle = sentences[0]?.trim() || "";
  }
  if (!subtitle) {
    const titleLower = product.title.toLowerCase();
    if (titleLower.includes("mist")) subtitle = "Refreshing botanical mist for deep hydration";
    else if (titleLower.includes("sunshield") || titleLower.includes("sunscreen")) subtitle = "Non-greasy Ayurvedic sun shield";
    else if (titleLower.includes("calm balm")) subtitle = "Soothing multipurpose body balm";
    else if (titleLower.includes("lotion")) subtitle = "Intensely hydrating daily body moisturizer";
    else if (titleLower.includes("maalish")) subtitle = "Nourishing oil for radiant skin";
    else subtitle = "Pure Genurveda™ botanical treasure";
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating || !variantId) return;
    await addItem(variantId, 1);
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating || !lineId) return;
    await updateQuantity(lineId, quantityInCart + 1);
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating || !lineId) return;
    if (quantityInCart === 1) {
      await removeItem(lineId);
    } else {
      await updateQuantity(lineId, quantityInCart - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-black rounded-[4px] overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
      
      {/* Image & Badge Wrapper */}
      <Link href={`/products/${product.handle}`} className="relative block aspect-square bg-[#fafafa] overflow-hidden shrink-0">
        


        {/* Product image */}
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.altText || product.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            No Image
          </div>
        )}
      </Link>

      {/* Made for / Banner Banner */}
      {bannerText && (
        <div className="bg-black text-white text-[8px] font-poppins font-bold tracking-[0.2em] text-center py-2 uppercase shrink-0">
          {bannerText}
        </div>
      )}

      {/* Info Container */}
      <div className="flex flex-col flex-1 p-3.5 justify-between gap-3">
        
        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <Link href={`/products/${product.handle}`} className="block">
            <h3 className="text-sm font-poppins font-bold text-gray-900 group-hover:text-[#6c3518] transition-colors leading-snug line-clamp-1">
              {product.title}
            </h3>
          </Link>
          
          {subtitle && (
            <p className="text-[11px] font-poppins text-gray-500 line-clamp-1 italic font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Rating & Pricing Row */}
        <div className="flex items-center justify-between gap-2 mt-1 shrink-0">
          {/* Left: Star Rating */}
          <div className="flex items-center gap-1 text-[11px] font-poppins text-gray-800 font-medium shrink-0">
            <span className="text-black text-xs leading-none">★</span>
            <span>{totalReviews > 0 ? averageRating.toFixed(1) : "5.0"}</span>
            <span className="text-gray-400 font-normal">({totalReviews > 0 ? totalReviews : 1})</span>
          </div>

          {/* Right: Pricing */}
          <div className="flex items-center gap-1.5 text-right shrink-0">
            {formattedComparePrice && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-light">
                {formattedComparePrice}
              </span>
            )}
            <span className="text-xs sm:text-sm font-poppins font-bold text-[#6c3518]">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Add to Cart Container */}
        <div className="space-y-3 mt-auto">

          {/* Quantity Controls / Add to Cart button */}
          <div className="w-full">
            {quantityInCart > 0 ? (
              <div className="flex items-center justify-between border border-[#6c3518] rounded-[4px] overflow-hidden bg-white h-[38px]">
                <button
                  onClick={handleDecrease}
                  disabled={isUpdating}
                  className="w-12 h-full flex items-center justify-center hover:bg-[#f5f1e6]/45 active:bg-[#f5f1e6] transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} className="text-[#6c3518]" />
                </button>
                <span className="font-poppins font-bold text-xs text-[#6c3518] w-8 text-center select-none">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={isUpdating}
                  className="w-12 h-full flex items-center justify-center hover:bg-[#f5f1e6]/45 active:bg-[#f5f1e6] transition-colors disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} className="text-[#6c3518]" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isUpdating}
                className="w-full h-[38px] flex items-center justify-center gap-1.5 bg-[#6c3518] hover:bg-black active:bg-black text-white font-poppins font-bold text-[10px] tracking-[0.15em] uppercase border border-[#6c3518] rounded-[4px] transition-colors disabled:opacity-50"
              >
                <ShoppingBag size={13} className="text-white shrink-0" />
                Add To Cart
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
