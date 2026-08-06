"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import { ShopifyProduct, getStockInfo, getProductInfo } from "@/lib/shopify";
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

  // Real banner label from the custom.info Shopify metafield. No dummy fallback.
  const bannerText = getProductInfo(product);

  // Subtitle / snippet description — first sentence of the real Shopify
  // description. No dummy fallback; the subtitle just doesn't render if a
  // product has no description yet.
  const subtitle = product.description?.split(/[.!?]+/)[0]?.trim() || "";

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
    <div className="flex flex-col h-full bg-transparent border-2 border-black overflow-hidden group shadow-sm hover:shadow-md transition-shadow">

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
        <div className="bg-black text-white text-[10px] font-inter font-semibold tracking-[0.1em] py-1.5 px-2 flex items-center justify-center text-center uppercase leading-none min-h-[26px]">
          {bannerText.trim()}
        </div>

      )}

      {/* Info Container */}
      <div className="flex flex-col flex-1 p-2 sm:p-2 justify-between gap-1.5 sm:gap-2 bg-transparent">

        {/* Title & Subtitle */}
        <div className="space-y-0.5">
          <Link href={`/products/${product.handle}`} className="block">
            <h3 className="text-[12px] sm:text-[14px] font-inter font-semibold text-black group-hover:text-[#B40417] transition-colors leading-snug line-clamp-2">
              {product.title}
            </h3>
          </Link>

          {subtitle && (
            <p className="text-[10px] sm:text-[12px] font-inter-bold text-black line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Rating & Pricing Row */}
        <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2 mt-0 shrink-0">
          {/* Left: Star Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[12px] font-inter text-gray-800 font-medium shrink-0">
            <span className="text-black text-[12px] sm:text-[14px] leading-none">★</span>
            <span>{totalReviews > 0 ? averageRating.toFixed(1) : "5.0"}</span>
            <span className="text-gray-400 font-normal">({totalReviews > 0 ? totalReviews : 1})</span>
          </div>

          {/* Right: Pricing */}
          <div className="flex items-baseline gap-1 sm:gap-1.5 shrink-0">
            {formattedComparePrice && (
              <span className="text-[10px] sm:text-[12px] text-gray-500 font-semibold line-through font-light">
                {formattedComparePrice}
              </span>
            )}
            <span className="text-[16px] sm:text-[14px] font-semibold font-inter text-black">
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
                className="w-full h-[34px] sm:h-[44px] flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-400 font-inter font-bold text-[10px] sm:text-[14px] tracking-[0.1em] sm:tracking-[0.15em] uppercase cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center justify-between border border-[#6c3518] overflow-hidden bg-[#B40417] h-[34px] sm:h-[44px]">
                <button
                  onClick={handleDecrease}
                  disabled={isUpdating}
                  className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-[#f5f1e6]/45 active:bg-[#f5f1e6] transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} className="text-white" />
                </button>
                <span className="font-inter font-semibold text-[12px] sm:text-[14px] text-white w-6 sm:w-8 text-center select-none">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={isUpdating || quantityInCart >= maxQuantity}
                  className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-[#f5f1e6]/45 active:bg-[#f5f1e6] transition-colors disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isUpdating}
                className="w-full h-[34px] sm:h-[44px] flex items-center justify-center gap-1 sm:gap-1.5 bg-[#B40417] border border-[#B40417] hover:bg-[#ffffff] hover:text-[#B40417] font-semibold active:bg-[#B40417] text-[#ffffff] font-inter text-[10px] sm:text-[14px] tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-colors disabled:opacity-70"
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
