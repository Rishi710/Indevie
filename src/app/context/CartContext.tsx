"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { createCart, addToCart, updateCartLine, removeFromCart, fetchCart, updateCartBuyerIdentity } from "@/lib/shopify";
import { pixelAddToCart } from "@/lib/pixel";

const CART_COOKIE_KEY = "shopify_cart_id";

interface CartContextType {
  cart: any;
  isCartOpen: boolean;
  isUpdating: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (variantId: string, quantity?: number) => Promise<any>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  totalQuantity: number;
  updateBuyerIdentity: (customerAccessToken?: string, email?: string, phone?: string) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize or fetch existing cart
  useEffect(() => {
    const initCart = async () => {
      const existingCartId = Cookies.get(CART_COOKIE_KEY);
      if (existingCartId) {
        const fetchedCart = await fetchCart(existingCartId);
        if (fetchedCart) {
          setCart(fetchedCart);
        } else {
          // If fetchedCart is null, the cart might have expired or been deleted in Shopify
          Cookies.remove(CART_COOKIE_KEY);
        }
      }
      setIsInitializing(false);
    };
    initCart();
  }, []);

  const addItem = async (variantId: string, quantity = 1) => {
    if (isUpdating) return null;
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
        updatedCart = await addToCart(currentCartId, variantId, quantity);
      }

      if (updatedCart) {
        setCart(updatedCart);
        setIsCartOpen(true); // Open drawer automatically when item is added

        // Fire Meta Pixel AddToCart event
        // Find the newly added line to get price/title for richer data
        const newLine = updatedCart?.lines?.nodes?.find((l: any) =>
          l.merchandise?.id === variantId
        );
        pixelAddToCart({
          id: newLine?.merchandise?.product?.id || variantId,
          variantId: newLine?.merchandise?.id ?? variantId,
          title: newLine?.merchandise?.product?.title || "Product",
          price: newLine?.merchandise?.price?.amount || "0",
          currencyCode: newLine?.merchandise?.price?.currencyCode || "INR",
          quantity,
        });

        return updatedCart;
      }
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (lineId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const currentCartId = Cookies.get(CART_COOKIE_KEY);
      if (!currentCartId) return;

      const updatedCart = await removeFromCart(currentCartId, lineId);
      if (updatedCart) {
        setCart(updatedCart);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) {
      return removeItem(lineId);
    }

    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const currentCartId = Cookies.get(CART_COOKIE_KEY);
      if (!currentCartId) return;

      const updatedCart = await updateCartLine(currentCartId, lineId, quantity);
      if (updatedCart) {
        setCart(updatedCart);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const updateBuyerIdentity = useCallback(async (customerAccessToken?: string, email?: string, phone?: string) => {
    if (isUpdating) return null;
    setIsUpdating(true);
    try {
      const currentCartId = Cookies.get(CART_COOKIE_KEY);
      if (!currentCartId) return null;

      const buyerIdentityInput: any = {};
      if (customerAccessToken) buyerIdentityInput.customerAccessToken = customerAccessToken;
      if (email) buyerIdentityInput.email = email;
      if (phone) buyerIdentityInput.phone = phone;

      // If we only have a token but no info, we could fetch customer info here if needed
      // but for now we'll just pass what we have.

      const updatedCart = await updateCartBuyerIdentity(currentCartId, buyerIdentityInput);
      if (updatedCart) {
        setCart(updatedCart);
        return updatedCart;
      }
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating]);

  const totalQuantity = cart?.totalQuantity || 0;

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
