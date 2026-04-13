"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
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
    updateBuyerIdentity
  } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  const subtotal = cart?.cost?.subtotalAmount;

  const handleCheckout = async () => {
    if (isUpdating) return;
    
    const token = Cookies.get("customerAccessToken");
    if (token && cart?.id) {
      // Sync buyer identity before checkout if logged in
      await updateBuyerIdentity(token);
    }
    
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f5f1e6] shadow-2xl z-[1000] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#6c3518]/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#6c3518]" />
                <h2 className="text-xl font-poppins font-medium text-[#6c3518] italic">Your Cart</h2>
                <span className="bg-[#6c3518] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {totalQuantity}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#6c3518]/5 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={24} className="text-[#6c3518]" />
              </button>
            </div>

            {/* Line Items */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 transition-opacity duration-300 ${isUpdating ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
              {cart?.lines?.nodes.length > 0 ? (
                cart.lines.nodes.map((line: any) => (
                  <div key={line.id} className="flex gap-4 group">
                    <div className="relative w-24 h-32 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-[#6c3518]/5">
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
                            className="text-sm font-poppins font-medium text-[#6c3518] hover:opacity-70 transition-opacity"
                          >
                            {line.merchandise.product.title}
                          </Link>
                          <button 
                            onClick={() => removeItem(line.id)}
                            disabled={isUpdating}
                            className="text-[#6c3518]/40 hover:text-red-500 transition-colors disabled:opacity-30"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                          {line.merchandise.title !== "Default Title" ? line.merchandise.title : "Standard Ritual"}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-[#6c3518]/10 rounded-md bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            disabled={isUpdating}
                            className="px-2 py-1 hover:bg-[#6c3518]/5 transition-colors disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} className="text-[#6c3518]" />
                          </button>
                          <span className="w-8 text-center text-xs font-poppins text-[#6c3518] font-medium">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            disabled={isUpdating}
                            className="px-2 py-1 hover:bg-[#6c3518]/5 transition-colors disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} className="text-[#6c3518]" />
                          </button>
                        </div>
                        <p className="text-sm font-poppins font-bold text-[#6c3518]">
                          {line.estimatedCost.totalAmount.currencyCode} {parseFloat(line.estimatedCost.totalAmount.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-12">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#6c3518]/20 border border-[#6c3518]/5 shadow-sm">
                    <ShoppingBag size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-poppins font-medium text-[#6c3518] italic">Your bag is empty.</p>
                    <p className="text-xs text-gray-500 font-poppins italic tracking-wide">Begin your skincare with Indevie today.</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-8 py-3 bg-[#6c3518] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-[5px] hover:bg-black transition-all hover:scale-105"
                  >
                    Explore Indevie
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart?.lines?.nodes.length > 0 && (
              <div className="p-8 bg-white border-t border-[#6c3518]/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#6c3518]/50 uppercase">Subtotal</p>
                    <p className="text-xs text-gray-400 font-poppins italic">Shipping & taxes calculated at checkout</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-poppins font-bold text-[#6c3518]">
                      {subtotal?.currencyCode} {parseFloat(subtotal?.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isUpdating}
                  className="group w-full flex items-center justify-between bg-[#6c3518] text-white p-6 rounded-xl hover:bg-black transition-all duration-500 shadow-xl shadow-[#6c3518]/10 disabled:opacity-50"
                >
                  <span className="text-sm font-poppins font-bold tracking-[0.2em] uppercase underline-offset-4 group-hover:underline">
                    {isUpdating ? "Preparing Checkout..." : "Proceed to Checkout"}
                  </span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
                
                <p className="text-[9px] text-center text-gray-800 uppercase tracking-[0.3em] font-light">
                  SECURE SHOPPING • FAST SHIPPING • SATISFACTION GUARANTEED
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
