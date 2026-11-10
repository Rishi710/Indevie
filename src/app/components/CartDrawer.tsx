"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles, Tag, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getStockInfo } from "@/lib/shopify";
import { isTravelMini } from "@/lib/minisOffer";
import { triggerGokwikCheckout } from "@/lib/gokwik";
import { useScrollLock } from "@/lib/useScrollLock";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";

const formatMoney = (amount: number, symbol = "₹") => {
  const formatted = amount % 1 !== 0
    ? amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString("en-IN");
  return `${symbol}${formatted}`;
};

// Consolidates duplicate lines belonging to the same product/variant into a single line
const getConsolidatedLines = (rawLines: any[] = []) => {
  const groupedLines: any[] = [];
  const map = new Map<string, any>();

  rawLines.forEach((line: any) => {
    const key = line.merchandise?.id || line.id;
    if (!map.has(key)) {
      const entry = {
        ...line,
        quantity: line.quantity || 1,
        allLineIds: [line.id],
        extraLineIds: [] as string[],
      };
      map.set(key, entry);
      groupedLines.push(entry);
    } else {
      const existing = map.get(key);
      existing.quantity += (line.quantity || 1);
      existing.allLineIds.push(line.id);
      existing.extraLineIds.push(line.id);
    }
  });

  return groupedLines;
};

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    isUpdating,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    totalQuantity,
    updateBuyerIdentity,
    minisOffer,
    consolidateCart,
  } = useCart();

  // Prevent body scroll when drawer is open
  useScrollLock(isCartOpen);

  const subtotal = cart?.cost?.subtotalAmount;
  const rawSubtotalAmount = parseFloat(subtotal?.amount || "0");

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (isUpdating || isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      let currentCart = cart;
      const token = Cookies.get("customerAccessToken");

      if (token && cart?.id) {
        // Sync buyer identity before checkout if logged in
        const updatedCart = await updateBuyerIdentity(token);
        if (updatedCart) {
          currentCart = updatedCart;
        }
      }

      // Ensure Shopify cart is fully consolidated on Shopify servers before launching GoKwik
      const consolidated = await consolidateCart();
      if (consolidated) {
        currentCart = consolidated;
      }

      if (currentCart?.id) {
        // GoKwik SDK handles InitiateCheckout and Purchase tracking natively
        const opened = triggerGokwikCheckout(currentCart.id);
        if (!opened) {
          alert("Checkout is still loading — please try again in a moment.");
        }
      } else {
        alert("Cart not ready. Please try adding items again.");
      }
    } catch (err) {
      console.error("Checkout initiation error:", err);
      alert("Unable to open checkout. Please refresh the page and try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1000] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-[#B30617]/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-black" />
                <h2 className="text-xl font-inter font-light text-black italic">Your Cart</h2>
                <span className="bg-[#B30617] text-white text-[12px] font-light px-2 py-0.5 rounded-full">
                  {totalQuantity}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={24} className="text-black hover:text-[#B30617]" />
              </button>
            </div>

            {/* Travel Minis Special Offer Nudge Banner */}
            <div className="bg-gradient-to-r from-[#B30617]/10 via-[#B30617]/5 to-[#B30617]/10 px-6 py-3.5 border-b border-[#B30617]/15">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B30617] tracking-wider uppercase">
                  <Sparkles size={14} className="text-[#B30617] animate-pulse" />
                  <span>Travel Minis Offer</span>
                </div>
                {minisOffer.hasOfferApplied && (
                  <span className="bg-[#B30617] text-white text-[8px] font-semibold px-2 py-1 shadow-sm flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    SAVED ₹{minisOffer.discountAmount.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-gray-800 leading-snug">
                {minisOffer.bannerMessage}
              </p>

              {/* Progress Bar for Tier Goals */}
              <div className="mt-2 w-full bg-white/80 rounded-full h-2 overflow-hidden border border-[#B30617]/20 shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-[#B30617] to-[#e63946] h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${minisOffer.progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 transition-opacity duration-300 ${isUpdating ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
              {cart?.lines?.nodes && cart.lines.nodes.length > 0 ? (() => {
                const lines = getConsolidatedLines(cart.lines.nodes);

                // Check if Shopify has a live automatic discount applied
                const activeShopifyDiscount = cart?.discountAllocations?.find(
                  (alloc: any) => alloc.title && parseFloat(alloc.discountedAmount?.amount || "0") > 0
                );

                // Only count products eligible for the pack offers (exclude Travel Minis)
                const eligiblePackLines = lines.filter((l: any) => !isTravelMini(l.merchandise?.product));
                const totalPackQuantity = eligiblePackLines.reduce((sum: number, l: any) => sum + (l.quantity || 1), 0);

                // Global volume tier for pack offers (only for eligible full-size products)
                const packTierPercent = activeShopifyDiscount
                  ? (activeShopifyDiscount.title.includes("10%") ? 10 : activeShopifyDiscount.title.includes("5%") ? 5 : 0)
                  : (totalPackQuantity >= 3 ? 10 : totalPackQuantity === 2 ? 5 : 0);

                return lines.map((line: any, index: number) => {
                  const { maxQuantity } = getStockInfo(line.merchandise);
                  const isMini = isTravelMini(line.merchandise?.product);

                  const quantity = line.quantity || 1;
                  const unitPrice = parseFloat(line.merchandise?.price?.amount || "0");
                  const unitCompareAtPrice = line.merchandise?.compareAtPrice ? parseFloat(line.merchandise.compareAtPrice.amount) : 0;
                  const lineOriginalTotal = unitPrice * quantity;

                  // Discount for this line:
                  // Travel Minis are EXCLUDED from pack offers — they only receive Travel Minis offer if eligible.
                  const discountPercent = isMini
                    ? (minisOffer.hasOfferApplied ? minisOffer.discountPercent : 0)
                    : packTierPercent;

                  const isDiscountedLine = discountPercent > 0;

                  const lineDiscountAmount = isDiscountedLine
                    ? Math.round((lineOriginalTotal * (discountPercent / 100)) * 100) / 100
                    : 0;
                  const lineStandardTotal = lineOriginalTotal - lineDiscountAmount;

                  const lineCompareAtTotal = unitCompareAtPrice > unitPrice
                    ? unitCompareAtPrice * quantity
                    : isDiscountedLine && lineDiscountAmount > 0
                      ? lineOriginalTotal
                      : 0;

                  const currencyCode = line.merchandise?.price?.currencyCode || "INR";
                  const currencySymbol = currencyCode === "INR" ? "₹" : currencyCode;

                  return (
                    <div key={line.id}>
                      <div className="flex gap-3.5 group items-start">
                        {/* Rounded product thumbnail */}
                        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 border border-black/10">
                          {line.merchandise?.image?.url ? (
                            <Image
                              src={line.merchandise.image.url}
                              alt={line.merchandise.image.altText || line.merchandise?.product?.title || "Product"}
                              fill
                              sizes="88px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              href={`/products/${line.merchandise.product.handle}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-[15px] font-inter font-medium text-black leading-snug hover:text-[#B30617] transition-colors line-clamp-2"
                            >
                              {line.merchandise.product.title}
                            </Link>

                            <div className="text-right shrink-0">
                              {lineCompareAtTotal > lineStandardTotal ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-[12px] text-gray-400 line-through font-inter font-normal leading-tight">
                                    {formatMoney(lineCompareAtTotal, currencySymbol)}
                                  </span>
                                  <span className="text-[15px] font-inter font-bold text-black leading-tight">
                                    {formatMoney(lineStandardTotal, currencySymbol)}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-[15px] font-inter font-bold text-black leading-tight">
                                  {formatMoney(lineStandardTotal, currencySymbol)}
                                </p>
                              )}
                            </div>
                          </div>

                          {line.merchandise.title && line.merchandise.title !== "Default Title" && (
                            <p className="text-[13px] text-gray-500 font-inter mt-0.5">
                              {line.merchandise.title}
                            </p>
                          )}

                          {/* Offer Badge for Eligible Minis */}
                          {isMini && (
                            <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#B30617] bg-[#B30617]/10 px-2 py-0.5 rounded border border-[#B30617]/20">
                              <Tag size={10} />
                              <span>Travel Mini • Offer Eligible</span>
                            </div>
                          )}

                          {/* Capsule Quantity Selector + Remove Link */}
                          <div className="flex items-center gap-3.5 mt-2.5">
                            <div className="flex items-center border border-black/30 rounded-full px-3 py-1 bg-white">
                              <button
                                onClick={() => updateQuantity(line.id, line.quantity - 1, line.extraLineIds)}
                                disabled={isUpdating}
                                className="text-black/80 hover:text-black p-0.5 transition-colors disabled:opacity-30"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-7 text-center text-xs font-inter font-medium text-black">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(line.id, line.quantity + 1, line.extraLineIds)}
                                disabled={isUpdating || line.quantity >= maxQuantity}
                                className="text-black/80 hover:text-black p-0.5 transition-colors disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(line.allLineIds || line.id)}
                              disabled={isUpdating}
                              className="text-[12px] font-inter text-gray-500 underline underline-offset-2 hover:text-[#B30617] transition-colors disabled:opacity-30"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {index < lines.length - 1 && (
                        <div className="w-full h-[1px] bg-black/10 my-4" />
                      )}
                    </div>
                  );
                });
              })() : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-12">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#B30617]/20 border-2 border-[#B30617]/5 shadow-sm">
                    <ShoppingBag size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-inter font-medium text-[#B30617] italic">Your bag is empty.</p>
                    <p className="text-xs text-gray-500 font-inter italic tracking-wide">Begin your skincare with Indevie today.</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-8 py-3 bg-[#B30617] text-white text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-black transition-all hover:scale-105"
                  >
                    Explore Indevie
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart?.lines?.nodes && cart.lines.nodes.length > 0 && (() => {
              const lines = getConsolidatedLines(cart?.lines?.nodes || []);
              const currencySymbol = subtotal?.currencyCode === "INR" ? "₹" : (subtotal?.currencyCode || "₹");

              // 1. Calculate un-discounted subtotal from line items (full MRP / selling price before discounts)
              let rawOriginalSubtotal = 0;
              let eligiblePackSubtotal = 0;

              lines.forEach((line: any) => {
                const qty = line.quantity || 1;
                const unitPrice = parseFloat(line.merchandise?.price?.amount || "0");
                const lineTotal = unitPrice * qty;
                rawOriginalSubtotal += lineTotal;
                if (!isTravelMini(line.merchandise?.product)) {
                  eligiblePackSubtotal += lineTotal;
                }
              });

              // 2. Compute discount matching Shopify's Automatic Discounts (Amount off products)
              const discountLines: { label: string; amount: number }[] = [];

              // Check if Shopify has a live automatic discount applied
              const activeShopifyDiscount = cart?.discountAllocations?.find(
                (alloc: any) => alloc.title && parseFloat(alloc.discountedAmount?.amount || "0") > 0
              );

              // Only count products eligible for the pack offers (exclude Travel Minis)
              const eligiblePackLines = lines.filter((l: any) => !isTravelMini(l.merchandise?.product));
              const totalPackQuantity = eligiblePackLines.reduce((sum: number, l: any) => sum + (l.quantity || 1), 0);

              const packTierPercent = activeShopifyDiscount
                ? (activeShopifyDiscount.title.includes("10%") ? 10 : activeShopifyDiscount.title.includes("5%") ? 5 : 0)
                : (totalPackQuantity >= 3 ? 10 : totalPackQuantity === 2 ? 5 : 0);

              let hasShopifyAutomaticDiscount = false;
              if (cart?.discountAllocations && cart.discountAllocations.length > 0) {
                cart.discountAllocations.forEach((alloc: any) => {
                  const amount = parseFloat(alloc.discountedAmount?.amount || "0");
                  if (amount > 0) {
                    if (alloc.title) {
                      hasShopifyAutomaticDiscount = true;
                      discountLines.push({ label: alloc.title, amount });
                    } else if (alloc.code) {
                      discountLines.push({ label: `Coupon (${alloc.code})`, amount });
                    }
                  }
                });
              }

              // Fallback calculation if Shopify allocations haven't synced yet:
              // Pack discount applies ONLY to eligible full-size products (excluding Travel Minis!)
              if (!hasShopifyAutomaticDiscount && packTierPercent > 0 && eligiblePackSubtotal > 0) {
                const label = packTierPercent >= 10 ? "Pack of 3 (10% off)" : "Pack of 2 (5% off)";
                const discountAmount = Math.round((eligiblePackSubtotal * (packTierPercent / 100)) * 100) / 100;
                discountLines.push({ label, amount: discountAmount });
              }

              // Travel Minis offer support
              const minisSavings = minisOffer.hasOfferApplied ? minisOffer.discountAmount : 0;
              if (minisSavings > 0 && !discountLines.some(d => d.label.toLowerCase().includes("mini"))) {
                discountLines.push({
                  label: "Travel Minis offer discount",
                  amount: minisSavings,
                });
              }

              const totalDiscountAmount = discountLines.reduce((acc, d) => acc + d.amount, 0);
              const finalTotal = Math.max(0, rawOriginalSubtotal - totalDiscountAmount);

              return (
                <div className="p-5 sm:p-6 bg-white border-t border-black/10 space-y-4 font-inter">
                  {/* Breakdown exactly matching reference image */}
                  <div className="space-y-2 text-[14px]">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between text-gray-800">
                      <span>Subtotal</span>
                      <span className="font-medium text-black">
                        {formatMoney(rawOriginalSubtotal, currencySymbol)}
                      </span>
                    </div>

                    {/* Applied Discounts */}
                    {discountLines.map((disc) => (
                      <div key={disc.label} className="flex items-center justify-between text-[#B30617] font-medium text-[13.5px]">
                        <span>{disc.label}</span>
                        <span>-{formatMoney(disc.amount, currencySymbol)}</span>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex items-center justify-between text-[17px] font-bold text-black pt-2 border-t border-black/10">
                      <span>Total</span>
                      <span>{formatMoney(finalTotal, currencySymbol)}</span>
                    </div>

                    {/* Shipping and Delivery info */}
                    <p className="text-[12px] text-gray-500 pt-0.5 leading-normal">
                      Taxes included. Free shipping. Pay online or on delivery.
                    </p>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isUpdating || isCheckingOut}
                    className="group w-full flex items-center justify-between bg-[#B30617] text-white p-4.5 sm:p-5 hover:bg-black transition-all duration-300 shadow-xl shadow-[#B30617]/10 disabled:opacity-50"
                  >
                    <span className="text-sm font-inter font-semibold tracking-[0.18em] uppercase underline-offset-4 group-hover:underline">
                      {isUpdating || isCheckingOut ? "Preparing Checkout..." : "Proceed to Checkout"}
                    </span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>

                  <p className="text-[9px] text-center text-gray-800 uppercase tracking-[0.2em] font-light">
                    SECURE SHOPPING • FAST SHIPPING • SATISFACTION GUARANTEED
                  </p>
                </div>
              );
            })()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

