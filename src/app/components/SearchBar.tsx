"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollLock } from "@/lib/useScrollLock";
import { getProductConcerns } from "@/lib/shopify";

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  concernMetafield?: { value: string } | null;
  variants: {
    nodes: {
      id: string;
      price: { amount: string; currencyCode: string };
      compareAtPrice?: { amount: string; currencyCode: string } | null;
    }[];
  };
  images: {
    nodes: { url: string; altText?: string; width?: number; height?: number }[];
  };
}

interface SearchBarProps {
  solidMode: boolean;
}

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(parseFloat(amount));
}

// Bestseller product handles - replaces Quick Search chips
const BESTSELLER_HANDLES = [
  { label: "Face Mist", query: "mist" },
  { label: "Sunscreen", query: "sunscreen" },
  { label: "Calm Balm", query: "calm balm" },
  { label: "Body Lotion", query: "lotion" },
  { label: "Glow Oil", query: "oil" },
  { label: "Gift Set", query: "gift" },
];

// Featured products shown in the default state when no concern is selected
const FEATURED_HANDLES = [
  { handle: "indevie-calm-balm", title: "Calm Balm 50gm" },
  { handle: "geeli-mitti-face-mist", title: "Geeli Mitti Face Mist" },
  { handle: "gulkand-face-mist", title: "Gulkand Face Mist" },
  { handle: "gulaab-tez-dhoop-sunshield-ayurvedic-spf-50-pa-sunscreen", title: "Gulaab Tez Dhoop Sunshield" },
];

export default function SearchBar({ solidMode }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  
  // Dynamic Shopify catalog and filters
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [dynamicConcerns, setDynamicConcerns] = useState<string[]>([]);
  const [activeConcern, setActiveConcern] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch Shopify product catalog to build concern tags and local concern filtering
  useEffect(() => {
    if (isOpen) {
      const fetchCatalog = async () => {
        try {
          const fetchProductsQuery = {
            query: `
              query getSearchProducts {
                products(first: 50) {
                  nodes {
                    id
                    title
                    handle
                    tags
                    concernMetafield: metafield(namespace: "custom", key: "concern") {
                      value
                    }
                    variants(first: 1) {
                      nodes {
                        id
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                      }
                    }
                    images(first: 1) {
                      nodes {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            `
          };

          const response = await fetch("/api/shopify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fetchProductsQuery),
          });
          const res = await response.json();
          const products: SearchProduct[] = res.data?.products?.nodes || [];
          setAllProducts(products);

          // Compile unique concern values from the real custom.concern metafield only.
          const uniqueConcerns = new Set<string>();
          products.forEach((p) => {
            getProductConcerns(p).forEach((concern) => uniqueConcerns.add(concern));
          });

          setDynamicConcerns(Array.from(uniqueConcerns).sort((a, b) => a.localeCompare(b)));
        } catch (err) {
          console.error("Error loading products/concerns from Shopify:", err);
          setDynamicConcerns([]);
        }
      };

      fetchCatalog();
    }

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setActiveConcern(null);
    }
  }, [isOpen]);

  // Lock body scroll and compensate for scrollbar width to prevent layout shift
  useScrollLock(isOpen);

  const close = useCallback(() => setIsOpen(false), []);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => doSearch(val), 280);
    },
    [doSearch]
  );

  const triggerQuick = useCallback(
    (q: string, label: string) => {
      setQuery(label);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      doSearch(q);
    },
    [doSearch]
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  }, []);

  const handleResultClick = useCallback(() => close(), [close]);

  const handleConcernClick = useCallback((concern: string) => {
    setActiveConcern((prev) => (prev === concern ? null : concern));
  }, []);

  const showDefault = !query || query.trim().length < 2;

  // Retrieve popular default products
  const displayFeatured = useMemo(() => {
    if (allProducts.length === 0) return [];
    const matched = FEATURED_HANDLES.map((fh) =>
      allProducts.find((p) => p.handle === fh.handle)
    ).filter(Boolean) as SearchProduct[];

    if (matched.length > 0) return matched;
    return allProducts.slice(0, 4);
  }, [allProducts]);

  // Dynamically filter products to display by the selected concern
  const displayedProductsByConcern = useMemo(() => {
    if (activeConcern) {
      return allProducts.filter((p) => getProductConcerns(p).includes(activeConcern));
    }
    return displayFeatured;
  }, [activeConcern, allProducts, displayFeatured]);

  return (
    <>
      {/* Trigger Icon */}
      <button
        id="search-trigger-btn"
        onClick={() => setIsOpen(true)}
        className={`hover:opacity-70 transition-opacity flex items-center justify-center ${solidMode ? "text-gray-800" : "text-white"}`}
        aria-label="Open search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.25}
          stroke="currentColor"
          className="w-5 h-5 md:w-6 md:h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60]"
              onClick={close}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed top-0 left-0 z-[70] bg-white"
              style={{
                width: "100vw",
                boxShadow: "0 8px 40px rgba(108,53,24,0.12)",
              }}
            >
              {/* ── Input Row ── */}
              <div className="w-full px-4 sm:px-8 lg:px-16 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Search Icon / Spinner */}
                  {isLoading ? (
                    <svg className="animate-spin w-5 h-5 text-[#6c3518] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#6c3518]/60 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  )}

                  {/* Input */}
                  <input
                    ref={inputRef}
                    id="search-input"
                    type="search"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search by product, ingredient, concern, benefit…"
                    className="flex-1 py-2.5 text-base sm:text-lg text-gray-800 placeholder-gray-350 bg-transparent outline-none font-poppins"
                    autoComplete="off"
                    spellCheck={false}
                  />

                  {/* Clear query button */}
                  <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15 }}
                        onClick={clearQuery}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors shrink-0"
                        aria-label="Clear"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Close button */}
                  <button
                    onClick={close}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 ml-1"
                    aria-label="Close search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Bottom accent line */}
                <div className="mt-3 h-[1.5px] w-full bg-gradient-to-r from-[#6c3518]/40 via-[#6c3518]/10 to-transparent rounded-full" />
              </div>

              {/* ── Body ── */}
              <div className="w-full max-h-[70vh] overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-16 py-6">

                {/* ─── DEFAULT STATE ─── */}
                {showDefault && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                    {/* LEFT: Bestsellers + Browse by Concern */}
                    <div className="space-y-7">

                      {/* BESTSELLERS chips */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-[3px] h-[14px] bg-[#6c3518] inline-block rounded-sm" />
                          <p className="text-[10px] uppercase tracking-[0.22em] text-[#6c3518] font-poppins font-bold">
                            Bestsellers
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {BESTSELLER_HANDLES.map((item) => (
                            <button
                              key={item.query}
                              onClick={() => triggerQuick(item.query, item.label)}
                              className="text-xs font-poppins font-semibold px-3.5 py-1.5 bg-[#f5f1e6] text-[#6c3518] border border-[#6c3518]/20 rounded-full hover:bg-[#6c3518] hover:text-white hover:border-[#6c3518] transition-all duration-200"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* BROWSE BY CONCERN — Clean grid pills, icons removed */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-[3px] h-[14px] bg-[#6c3518] inline-block rounded-sm" />
                          <p className="text-[10px] uppercase tracking-[0.22em] text-[#6c3518] font-poppins font-bold">
                            Shop by Concern
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {dynamicConcerns.map((concern) => {
                            const isActive = activeConcern === concern;
                            return (
                              <button
                                key={concern}
                                onClick={() => handleConcernClick(concern)}
                                className={`px-4 py-3 rounded-xl text-[11px] font-poppins font-bold uppercase tracking-wider transition-all duration-200 text-left border ${
                                  isActive
                                    ? "bg-[#6c3518] border-[#6c3518] text-white shadow-md scale-[1.01]"
                                    : "bg-[#faf8f4] border-[#6c3518]/10 hover:border-[#6c3518]/30 hover:bg-[#faf8f3] text-gray-700"
                                }`}
                              >
                                {concern}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Featured Products list, filtered dynamically by active concern */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-[3px] h-[14px] bg-[#6c3518] inline-block rounded-sm" />
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#6c3518] font-poppins font-bold">
                          {activeConcern ? `Products for ${activeConcern}` : "Popular Products"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {displayedProductsByConcern.length > 0 ? (
                          displayedProductsByConcern.map((product) => {
                            const image = product.images?.nodes?.[0];
                            const price = product.variants?.nodes?.[0]?.price;
                            return (
                              <Link
                                key={product.id}
                                href={`/products/${product.handle}`}
                                onClick={handleResultClick}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#faf8f3] group transition-colors duration-150 border border-transparent hover:border-[#6c3518]/10 bg-[#faf8f4]/60"
                              >
                                <div className="w-12 h-12 rounded-lg bg-[#f5f1e6] overflow-hidden shrink-0 relative border border-gray-100">
                                  {image ? (
                                    <Image src={image.url} alt={image.altText || product.title} fill className="object-cover" sizes="48px" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-[#6c3518]/20">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-poppins font-medium text-gray-700 group-hover:text-[#6c3518] transition-colors truncate">
                                    {product.title}
                                  </p>
                                  {price && (
                                    <p className="text-xs font-poppins text-[#6c3518]/70 mt-0.5 font-bold">
                                      {formatPrice(price.amount, price.currencyCode)}
                                    </p>
                                  )}
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6c3518] group-hover:translate-x-0.5 transition-all shrink-0">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-gray-400 text-xs font-poppins italic">
                            No products currently loaded for this concern.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* ─── RESULTS STATE ─── */}
                {!showDefault && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {results.length > 0 ? (
                        <>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-poppins font-semibold mb-3">
                            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                          </p>

                          <ul className="space-y-1">
                            {results.map((product) => {
                              const price = product.variants.nodes[0]?.price;
                              const compareAt = product.variants.nodes[0]?.compareAtPrice;
                              const image = product.images.nodes[0];
                              return (
                                <li key={product.id}>
                                  <Link
                                    href={`/products/${product.handle}`}
                                    onClick={handleResultClick}
                                    className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-[#faf8f3] group transition-colors duration-150"
                                  >
                                    {/* Compact thumbnail */}
                                    <div className="w-11 h-11 rounded-lg bg-[#f5f1e6] overflow-hidden shrink-0 relative">
                                      {image ? (
                                        <Image
                                          src={image.url}
                                          alt={image.altText || product.title}
                                          fill
                                          className="object-cover"
                                          sizes="44px"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4 text-[#6c3518]/20">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-poppins font-medium text-gray-800 group-hover:text-[#6c3518] transition-colors truncate leading-snug">
                                        {product.title}
                                      </p>
                                      {product.tags?.length > 0 && (
                                        <p className="text-[10px] text-gray-400 font-poppins truncate mt-0.5 leading-tight">
                                          {product.tags.slice(0, 3).join(" · ")}
                                        </p>
                                      )}
                                    </div>

                                    {/* Price */}
                                    {price && (
                                      <div className="text-right shrink-0">
                                        <span className="text-sm font-semibold text-[#6c3518] font-poppins">
                                          {formatPrice(price.amount, price.currencyCode)}
                                        </span>
                                        {compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount) && (
                                          <p className="text-[10px] text-gray-400 line-through font-poppins">
                                            {formatPrice(compareAt.amount, compareAt.currencyCode)}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6c3518] group-hover:translate-x-0.5 transition-all shrink-0">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>

                          {/* View all */}
                          <Link
                            href={`/shop?q=${encodeURIComponent(query)}`}
                            onClick={handleResultClick}
                            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-[#6c3518]/20 rounded-xl text-sm font-poppins font-medium text-[#6c3518] hover:bg-[#6c3518] hover:text-white transition-all duration-200"
                          >
                            View all results
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </Link>
                        </>
                      ) : hasSearched ? (
                        <div className="py-10 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#f5f1e6] flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#6c3518]/50">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-poppins text-sm font-medium">
                            No results for &ldquo;<span className="text-[#6c3518]">{query}</span>&rdquo;
                          </p>
                          <p className="text-gray-400 font-poppins text-xs mt-1">
                            Try a different ingredient, concern, or product name.
                          </p>
                        </div>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
