"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles, Tag, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getStockInfo } from "@/lib/shopify";
import { isTravelMini } from "@/lib/minisOffer";
import { pixelInitiateCheckout, toShopifyContentId } from "@/lib/pixel";
import { triggerGokwikCheckout } from "@/lib/gokwik";
import { useScrollLock } from "@/lib/useScrollLock";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";

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
  } = useCart();

  // Prevent body scroll when drawer is open
  useScrollLock(isCartOpen);

  const subtotal = cart?.cost?.subtotalAmount;
  const rawSubtotalAmount = parseFloat(subtotal?.amount || "0");

  const handleCheckout = async () => {
    if (isUpdating) return;

    let currentCart = cart;
    const token = Cookies.get("customerAccessToken");

    if (token && cart?.id) {
      // Sync buyer identity before checkout if logged in
      const updatedCart = await updateBuyerIdentity(token);
      if (updatedCart) {
        currentCart = updatedCart;
      }
    }

    if (currentCart?.id) {
      // Fire InitiateCheckout pixel event before opening checkout
      const lines = currentCart?.lines?.nodes || [];
      pixelInitiateCheckout({
        numItems: currentCart?.totalQuantity || 0,
        value: parseFloat(currentCart?.cost?.subtotalAmount?.amount || "0"),
        currencyCode: currentCart?.cost?.subtotalAmount?.currencyCode || "₹",
        contentIds: lines.map((l: any) => toShopifyContentId(l.merchandise?.product?.id, l.merchandise?.id)).filter(Boolean),
      });

      const opened = triggerGokwikCheckout(currentCart.id);
      if (!opened) {
        alert("Checkout is still loading — please try again in a moment.");
      }
    } else {
      console.error("No cart found", currentCart);
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
              {cart?.lines?.nodes.length > 0 ? (
                cart.lines.nodes.map((line: any, index: number) => {
                  const { maxQuantity } = getStockInfo(line.merchandise);
                  const isMini = isTravelMini(line.merchandise?.product);

                  const quantity = line.quantity || 1;
                  const unitPrice = parseFloat(line.merchandise?.price?.amount || "0");
                  const unitCompareAtPrice = line.merchandise?.compareAtPrice ? parseFloat(line.merchandise.compareAtPrice.amount) : 0;

                  // Standard line item pricing (does not override with dynamic discounts)
                  const lineStandardTotal = unitPrice * quantity;
                  const lineCompareAtTotal = unitCompareAtPrice > unitPrice ? unitCompareAtPrice * quantity : 0;

                  const currencyCode = line.merchandise?.price?.currencyCode || "INR";
                  const currencySymbol = currencyCode === "INR" ? "₹" : currencyCode;

                  return (
                    <div key={line.id}>
                      <div className="flex gap-4 group">
                        <div className="relative w-24 h-32 bg-white overflow-hidden flex-shrink-0 border-[#B30617]">
                          {line.merchandise.image ? (
                            <Image
                              src={line.merchandise.image.url}
                              alt={line.merchandise.image.altText || line.merchandise.product.title}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <Link
                                href={`/products/${line.merchandise.product.handle}`}
                                onClick={() => setIsCartOpen(false)}
                                className="text-[16px] font-inter font-medium text-black hover:opacity-70 transition-opacity"
                              >
                                {line.merchandise.product.title}
                              </Link>
                              <button
                                onClick={() => removeItem(line.id)}
                                disabled={isUpdating}
                                className="text-[#B30617]/40 hover:text-red-500 transition-colors disabled:opacity-30"
                                aria-label="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                              {line.merchandise.title !== "Default Title" ? line.merchandise.title : "Standard Ritual"}
                            </p>

                            {/* Offer Badge for Eligible Minis */}
                            {isMini && (
                              <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-[#B30617] bg-[#B30617]/10 px-2 py-0.5 border border-[#B30617]/20">
                                <Tag size={10} />
                                <span>Travel Mini • Offer Eligible</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center border-1 border-[#B30617] bg-white overflow-hidden">
                              <button
                                onClick={() => updateQuantity(line.id, line.quantity - 1)}
                                disabled={isUpdating}
                                className="px-2 py-1 hover:bg-[#B30617]/5 transition-colors disabled:opacity-30"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} className="text-[#B30617]" />
                              </button>
                              <span className="w-8 text-center text-xs font-inter text-[#B30617] font-medium">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(line.id, line.quantity + 1)}
                                disabled={isUpdating || line.quantity >= maxQuantity}
                                className="px-2 py-1 hover:bg-[#B30617]/5 transition-colors disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} className="text-[#6c3518]" />
                              </button>
                            </div>

                            <div className="text-right">
                              {lineCompareAtTotal > lineStandardTotal ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-[11px] text-gray-400 line-through font-inter font-normal leading-tight">
                                    {currencySymbol} {lineCompareAtTotal.toLocaleString()}
                                  </span>
                                  <span className="text-sm font-inter font-semibold italic text-[#B30617] leading-tight">
                                    {currencySymbol} {lineStandardTotal.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm font-inter font-semibold italic text-[#B30617]">
                                  {currencySymbol} {lineStandardTotal.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {index < cart.lines.nodes.length - 1 && (
                        <div className="w-full h-[1px] bg-[#B30617]/25 mt-6" />
                      )}
                    </div>
                  );
                })
              ) : (
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
            {cart?.lines?.nodes.length > 0 && (() => {
              const lines = cart?.lines?.nodes || [];
              const currencySymbol = subtotal?.currencyCode === "INR" ? "₹" : (subtotal?.currencyCode || "₹");

              let rawCartStandardTotal = 0;
              let totalCartCompareSubtotal = 0;

              lines.forEach((line: any) => {
                const qty = line.quantity || 1;
                const unitPrice = parseFloat(line.merchandise?.price?.amount || "0");
                const unitCompareAtPrice = line.merchandise?.compareAtPrice ? parseFloat(line.merchandise.compareAtPrice.amount) : 0;

                const lineStandard = unitPrice * qty;
                const lineCompare = unitCompareAtPrice > unitPrice ? unitCompareAtPrice * qty : lineStandard;

                rawCartStandardTotal += lineStandard;
                totalCartCompareSubtotal += lineCompare;
              });

              // Calculate offer savings and final subtotal
              const offerSavings = minisOffer.hasOfferApplied ? minisOffer.discountAmount : 0;
              const finalSubtotal = Math.max(0, rawCartStandardTotal - offerSavings);
              const displayCompareTotal = Math.max(totalCartCompareSubtotal, rawCartStandardTotal);
              const totalSavings = Math.max(0, Math.round(displayCompareTotal - finalSubtotal));

              return (
                <div className="p-6 bg-white border-t border-[#B30617]/10 space-y-4">
                  {/* Savings & Subtotal breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-semibold tracking-[0.1em] text-[#B30617] uppercase">Subtotal</p>
                        <p className="text-xs text-gray-800 font-inter italic"><a href="https://indevie.com/shipping-policy" target="_blank" rel="noopener noreferrer" className="cursor-pointer text-black underline font-semibold">Shipping & taxes</a> calculated at checkout</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {totalSavings > 0 && displayCompareTotal > finalSubtotal && (
                          <span className="text-sm text-gray-400 line-through font-inter font-normal leading-none mb-1">
                            {currencySymbol} {Math.round(displayCompareTotal).toLocaleString()}
                          </span>
                        )}
                        <p className="text-2xl font-inter italic font-semibold text-[#B30617] leading-none">
                          {currencySymbol} {finalSubtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-medium pt-1 border-t border-emerald-700/10">
                        {/* <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {minisOffer.hasOfferApplied && minisOffer.discountPercent > 0
                            ? `Minis ${minisOffer.discountPercent}% OFF Savings`
                            : "Total Savings"}
                        </span> */}
                        {/* <span>- {currencySymbol} {totalSavings.toLocaleString()}</span> */}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isUpdating}
                    className="group w-full flex items-center justify-between bg-[#B30617] text-white p-5 hover:bg-black transition-all duration-500 shadow-xl shadow-[#B30617]/10 disabled:opacity-50"
                  >
                    <span className="text-sm font-inter font-semibold tracking-[0.2em] uppercase underline-offset-4 group-hover:underline">
                      {isUpdating ? "Preparing Checkout..." : "Proceed to Checkout"}
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

