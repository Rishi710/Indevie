"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { ShopifyProduct, getStockInfo } from "@/lib/shopify";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: ShopifyProduct;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { cart, addItem, updateQuantity, removeItem, isUpdating } = useCart();
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const variant = product?.variants?.nodes[0];
  const variantId = variant?.id;
  const price = variant?.price;
  const compareAtPrice = variant?.compareAtPrice;
  const images = product?.images?.nodes || [];
  const mainImage = images[0];
  const { isOutOfStock, maxQuantity } = getStockInfo(variant);

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

  // Extract banners from tags, or use smart fallbacks
  const tags = product.tags || [];

  // Banner matching
  let bannerText = "";
  const customBannerTag = tags.find(t => t.toLowerCase().startsWith("banner:"));
  if (customBannerTag) {
    bannerText = customBannerTag.split(":")[1].toUpperCase();
  } else {
    // Smart defaults based on title / handle
    const titleLower = product.title.toLowerCase();
    if (titleLower.includes("geeli mitti")) bannerText = "FACE MISTL";
    else if (titleLower.includes("gulkand")) bannerText = "ROSE MIST";
    else if (titleLower.includes("sunshield") || titleLower.includes("sunscreen")) bannerText = "AYURVEDIC SPF 50";
    else if (titleLower.includes("calm balm")) bannerText = "SOOTHING SKIN RITUAL";
    else if (titleLower.includes("lotion")) bannerText = "DAILY BODY NOURISHMENT";
    else if (titleLower.includes("maalish")) bannerText = "GLOWING BODY OIL";
    else if (titleLower.includes("set") || titleLower.includes("ritual")) bannerText = "ULTIMATE SKIN RITUAL";
    else bannerText = "GENURVEDA™ APPROVED";
  }

  // Subtitle / snippet description
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
    if (isUpdating || !variantId || isOutOfStock) return;
    await addItem(variantId, 1);
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating || !lineId || quantityInCart >= maxQuantity) return;
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
    <div className="flex flex-col h-full bg-transparent border border-black overflow-hidden group shadow-sm hover:shadow-md transition-shadow">

      {/* Image Wrapper */}
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
        <div className="bg-black text-white text-[8px] font-sans font-bold tracking-[0.2em] text-center py-2 uppercase shrink-0">
          {bannerText}
        </div>
      )}

      {/* Info Container */}
      <div className="flex flex-col flex-1 p-2 sm:p-2 justify-between gap-2.5 sm:gap-3 bg-transparent">

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <Link href={`/products/${product.handle}`} className="block">
            <h3 className="text-xs sm:text-sm font-sans font-bold text-[#6c3518] group-hover:text-[#6c3518] transition-colors leading-snug line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {subtitle && (
            <p className="text-[10px] sm:text-[11px] font-sans text-gray-500 line-clamp-1 font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Rating & Pricing Row */}
        <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2 mt-0.5 shrink-0">
          {/* Left: Star Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-[18px] sm:text-[18px] font-sans text-gray-800 font-medium shrink-0">
            <span className="text-black text-[18px] sm:text-[18px] leading-none">★</span>
            <span>{totalReviews > 0 ? averageRating.toFixed(1) : "5.0"}</span>
            <span className="text-gray-400 font-normal">({totalReviews > 0 ? totalReviews : 1})</span>
          </div>

          {/* Right: Pricing */}
          <div className="flex items-baseline gap-1 sm:gap-1.5 shrink-0">
            {formattedComparePrice && (
              <span className="text-[18px] sm:text-[18px] text-gray-400 line-through font-light">
                {formattedComparePrice}
              </span>
            )}
            <span className="text-[18px] sm:text-[18px] font-poppins font-bold text-[#6c3518]">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Add to Cart Container */}
        <div className="space-y-2 mt-auto">
          {/* Quantity Controls / Add to Cart button */}
          <div className="w-full">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full h-[34px] sm:h-[44px] flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-400 font-sans font-bold text-[10px] sm:text-[14px] tracking-[0.1em] sm:tracking-[0.15em] uppercase cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center justify-between border border-[#6c3518] overflow-hidden bg-white h-[34px] sm:h-[44px]">
                <button
                  onClick={handleDecrease}
                  disabled={isUpdating}
                  className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-[#f5f1e6]/45 active:bg-[#f5f1e6] transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} className="text-[#6c3518]" />
                </button>
                <span className="font-sans font-bold text-[11px] sm:text-xs text-[#6c3518] w-6 sm:w-8 text-center select-none">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={isUpdating || quantityInCart >= maxQuantity}
                  className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-[#f5f1e6]/45 active:bg-[#f5f1e6] transition-colors disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} className="text-[#6c3518]" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isUpdating}
                className="w-full h-[34px] sm:h-[44px] flex items-center justify-center gap-1 sm:gap-1.5 bg-transparent border border-[#B40417] hover:bg-[ffffff] active:bg-[#B40417] text-[#B40417] font-sans font-bold text-[10px] sm:text-[14px] tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-colors disabled:opacity-70"
              >
                {/* <ShoppingBag size={12} className="text-white shrink-0" /> */}
                Add To Cart
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
