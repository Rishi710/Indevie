"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { createCart, addToCart, updateCartLine, removeFromCart, fetchCart, updateCartBuyerIdentity } from "@/lib/shopify";
import { pixelAddToCart } from "@/lib/pixel";
import { publishAddToCart } from "@/lib/shopifyAnalytics";

import { calculateMinisOffer, MinisOfferResult } from "@/lib/minisOffer";

const CART_COOKIE_KEY = "shopify_cart_id";

const normalizeId = (id?: string) => (id ? id.split("/").pop()?.split("?")[0] : "");

interface CartContextType {
  cart: any;
  isCartOpen: boolean;
  isUpdating: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (variantId: string, quantity?: number) => Promise<any>;
  removeItem: (lineId: string | string[]) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number, extraLineIds?: string[]) => Promise<void>;
  totalQuantity: number;
  updateBuyerIdentity: (customerAccessToken?: string, email?: string, phone?: string) => Promise<any>;
  clearCart: () => void;
  minisOffer: MinisOfferResult;
  consolidateCart: () => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const mountedRef = React.useRef(true);
  const isUpdatingRef = React.useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Helper to deduplicate any duplicate lines in a cart returned by Shopify
  const consolidateDuplicates = useCallback(async (cartData: any, cartId: string) => {
    if (!cartData?.lines?.nodes?.length) return cartData;
    const lines = cartData.lines.nodes;
    const variantMap = new Map<string, any[]>();
    lines.forEach((line: any) => {
      const vId = normalizeId(line.merchandise?.id);
      if (vId) {
        if (!variantMap.has(vId)) variantMap.set(vId, []);
        variantMap.get(vId)!.push(line);
      }
    });

    let hasDuplicates = false;
    for (const [, list] of variantMap) {
      if (list.length > 1) {
        hasDuplicates = true;
        break;
      }
    }

    if (!hasDuplicates) return cartData;

    let latestCart = cartData;
    for (const [, list] of variantMap) {
      if (list.length > 1) {
        const primary = list[0];
        const totalQty = list.reduce((sum: number, l: any) => sum + (l.quantity || 0), 0);
        const extraIds = list.slice(1).map((l: any) => l.id);
        const updated = await updateCartLine(cartId, primary.id, totalQty);
        if (updated) latestCart = updated;
        const cleaned = await removeFromCart(cartId, extraIds);
        if (cleaned) latestCart = cleaned;
      }
    }
    return latestCart;
  }, []);

  const cartRef = React.useRef<any>(null);
  // Keep ref in sync so consolidateCart doesn't depend on cart state directly
  cartRef.current = cart;

  const consolidateCart = useCallback(async () => {
    const currentCartId = Cookies.get(CART_COOKIE_KEY);
    if (!currentCartId) return null;
    const cartToClean = cartRef.current || (await fetchCart(currentCartId));
    if (!cartToClean) return null;
    const cleaned = await consolidateDuplicates(cartToClean, currentCartId);
    if (cleaned && mountedRef.current) {
      setCart(cleaned);
    }
    return cleaned;
  }, [consolidateDuplicates]);

  // Consolidate whenever cart drawer opens so Shopify stays 100% clean
  useEffect(() => {
    if (isCartOpen && !isInitializing) {
      consolidateCart();
    }
  }, [isCartOpen, consolidateCart, isInitializing]);

  // Initialize or fetch existing cart
  useEffect(() => {
    const initCart = async () => {
      const existingCartId = Cookies.get(CART_COOKIE_KEY);
      if (existingCartId) {
        const fetchedCart = await fetchCart(existingCartId);
        if (fetchedCart) {
          const consolidatedCart = await consolidateDuplicates(fetchedCart, existingCartId);
          if (mountedRef.current) {
            setCart(consolidatedCart);
          }
        } else {
          // If fetchedCart is null, the cart might have expired or been deleted in Shopify
          Cookies.remove(CART_COOKIE_KEY);
        }
      }
      if (mountedRef.current) {
        setIsInitializing(false);
      }
    };
    initCart();
  }, [consolidateDuplicates]);

  const addItem = async (variantId: string, quantity = 1) => {
    if (isUpdatingRef.current) return null;
    isUpdatingRef.current = true;
    setIsUpdating(true);
    try {
      let currentCartId = Cookies.get(CART_COOKIE_KEY);
      let updatedCart;

      if (!currentCartId) {
        updatedCart = await createCart(variantId, quantity);
        if (updatedCart) {
          Cookies.set(CART_COOKIE_KEY, updatedCart.id, { expires: 7 });
        }
      } else {
        // Retrieve cart to check if this variant is already present
        const currentCart = cart || (await fetchCart(currentCartId));
        const targetVId = normalizeId(variantId);
        const existingLines = (currentCart?.lines?.nodes || []).filter(
          (l: any) => normalizeId(l.merchandise?.id) === targetVId
        );

        if (existingLines.length > 0) {
          // Product already in cart: add quantity to existing primary line
          const totalExistingQty = existingLines.reduce(
            (sum: number, l: any) => sum + (l.quantity || 0),
            0
          );
          const targetQty = totalExistingQty + quantity;
          const primaryLine = existingLines[0];

          updatedCart = await updateCartLine(currentCartId, primaryLine.id, targetQty);

          // If there were extra duplicate lines in Shopify, remove them
          if (existingLines.length > 1) {
            const extraIds = existingLines.slice(1).map((l: any) => l.id);
            const cleanedCart = await removeFromCart(currentCartId, extraIds);
            if (cleanedCart) updatedCart = cleanedCart;
          }
        } else {
          updatedCart = await addToCart(currentCartId, variantId, quantity);
        }
      }

      if (updatedCart && mountedRef.current) {
        setCart(updatedCart);
        setIsCartOpen(true); // Open drawer automatically when item is added

        // Fire Meta Pixel AddToCart event
        // Find the newly added line using normalized ID matching
        const targetVId = normalizeId(variantId);
        const newLine = updatedCart?.lines?.nodes?.find(
          (l: any) => normalizeId(l.merchandise?.id) === targetVId
        );
        pixelAddToCart({
          id: newLine?.merchandise?.product?.id || variantId,
          variantId: newLine?.merchandise?.id ?? variantId,
          title: newLine?.merchandise?.product?.title || "Product",
          price: newLine?.merchandise?.price?.amount || "0",
          currencyCode: newLine?.merchandise?.price?.currencyCode || "INR",
          quantity,
        });

        // Shopify Analytics add-to-cart (feeds the "Added to cart" funnel step)
        if (newLine?.merchandise?.product) {
          publishAddToCart(updatedCart, newLine, quantity);
        }

        return updatedCart;
      }
      return null;
    } finally {
      isUpdatingRef.current = false;
      if (mountedRef.current) {
        setIsUpdating(false);
      }
    }
  };

  const removeItem = async (lineIdOrIds: string | string[]) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    setIsUpdating(true);
    try {
      const currentCartId = Cookies.get(CART_COOKIE_KEY);
      if (!currentCartId) return;

      const updatedCart = await removeFromCart(currentCartId, lineIdOrIds);
      if (updatedCart && mountedRef.current) {
        setCart(updatedCart);
      }
    } finally {
      isUpdatingRef.current = false;
      if (mountedRef.current) {
        setIsUpdating(false);
      }
    }
  };

  const updateQuantity = async (
    lineId: string,
    quantity: number,
    extraLineIds?: string[]
  ) => {
    if (isUpdatingRef.current) return;

    if (quantity < 1) {
      const toRemove =
        extraLineIds && extraLineIds.length > 0 ? [lineId, ...extraLineIds] : lineId;
      return removeItem(toRemove);
    }

    isUpdatingRef.current = true;
    setIsUpdating(true);
    try {
      const currentCartId = Cookies.get(CART_COOKIE_KEY);
      if (!currentCartId) return;

      let updatedCart = await updateCartLine(currentCartId, lineId, quantity);

      if (extraLineIds && extraLineIds.length > 0) {
        const cleanedCart = await removeFromCart(currentCartId, extraLineIds);
        if (cleanedCart) updatedCart = cleanedCart;
      }

      if (updatedCart && mountedRef.current) {
        setCart(updatedCart);
      } else {
        // Cart may have expired — re-fetch to sync UI with actual cart state
        const freshCart = await fetchCart(currentCartId);
        if (mountedRef.current) {
          if (freshCart) {
            setCart(freshCart);
          } else {
            // Cart gone entirely; clear it
            Cookies.remove(CART_COOKIE_KEY);
            setCart(null);
          }
        }
      }
    } finally {
      isUpdatingRef.current = false;
      if (mountedRef.current) {
        setIsUpdating(false);
      }
    }
  };

  const updateBuyerIdentity = useCallback(async (customerAccessToken?: string, email?: string, phone?: string) => {
    if (isUpdatingRef.current) return null;
    isUpdatingRef.current = true;
    setIsUpdating(true);
    try {
      const currentCartId = Cookies.get(CART_COOKIE_KEY);
      if (!currentCartId) return null;

      const buyerIdentityInput: any = {};
      if (customerAccessToken) buyerIdentityInput.customerAccessToken = customerAccessToken;
      if (email) buyerIdentityInput.email = email;
      if (phone) buyerIdentityInput.phone = phone;

      const updatedCart = await updateCartBuyerIdentity(currentCartId, buyerIdentityInput);
      if (updatedCart && mountedRef.current) {
        setCart(updatedCart);
        return updatedCart;
      }
      return null;
    } finally {
      isUpdatingRef.current = false;
      if (mountedRef.current) {
        setIsUpdating(false);
      }
    }
  }, []);

  // GoKwik checkout (Scenario 2) has no cart/clear.js endpoint to clear our
  // Shopify cart automatically after an order -- we own that responsibility.
  // Simplest correct approach: drop the cart cookie and local state; the
  // existing addItem() lazy-create-on-first-add logic naturally builds a
  // fresh cart the next time the user adds something.
  const clearCart = useCallback(() => {
    Cookies.remove(CART_COOKIE_KEY);
    setCart(null);
  }, []);

  // Listen for GoKwik's checkout events, posted via window.postMessage from
  // their checkout overlay. We only care about Order_Placed_GK here -- that's
  // our signal a purchase actually completed, so it's safe to empty the cart.
  useEffect(() => {
    const handleGokwikMessage = (event: MessageEvent) => {
      if (event.data?.type !== "gokwik_events") return;
      if (event.data?.event === "Order_Placed_GK") {
        clearCart();
      }
    };
    window.addEventListener("message", handleGokwikMessage);
    return () => window.removeEventListener("message", handleGokwikMessage);
  }, [clearCart]);

  const totalQuantity = cart?.totalQuantity || 0;
  const minisOffer = calculateMinisOffer(cart?.lines?.nodes || []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        isUpdating,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        totalQuantity,
        updateBuyerIdentity,
        clearCart,
        minisOffer,
        consolidateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
