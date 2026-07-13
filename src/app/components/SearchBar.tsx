"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  tags: string[];
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

const QUICK_SEARCHES = [
  { label: "Face Mist", query: "mist" },
  { label: "Sunscreen", query: "sunscreen" },
  { label: "Calm Balm", query: "calm balm" },
  { label: "Body Lotion", query: "lotion" },
  { label: "Glow Oil", query: "oil" },
  { label: "Gift Set", query: "gift" },
];

const CONCERNS = [
  "Sun Protection",
  "Deep Hydration",
  "Skin Glow",
  "Calming & Soothing",
  "Natural Ingredients",
];

// Featured products shown in the default (empty query) state
const FEATURED_HANDLES = [
  { handle: "geeli-mitti-face-mist", title: "Geeli Mitti Face Mist" },
  { handle: "indevie-calm-balm", title: "Calm Balm" },
  { handle: "indevie-glow-maalish-oil", title: "Glow Maalish Oil" },
];

export default function SearchBar({ solidMode }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-fetch featured products once overlay opens
  useEffect(() => {
    if (isOpen && featuredProducts.length === 0) {
      fetch("/api/search?q=indevie")
        .then((r) => r.json())
        .then((d) => setFeaturedProducts((d.products || []).slice(0, 3)))
        .catch(() => {});
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Lock body scroll and compensate for scrollbar width to prevent layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

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

  const showDefault = !query || query.trim().length < 2;

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

            {/* Search Panel — true 100vw, no right gap */}
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
                  {/* Search Icon */}
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

                  {/* Clear query button (only when typing) */}
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

                  {/* Close button — X only, no ESC text */}
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

              {/* ── Body ── max-h + scroll */}
              <div className="w-full max-h-[70vh] overflow-y-auto overscroll-contain px-4 sm:px-8 lg:px-16 py-5">

                {/* ─── DEFAULT STATE: two-column layout ─── */}
                {showDefault && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                    {/* Left: Quick Searches + Concerns */}
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-poppins font-semibold mb-3">
                          Quick Searches
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {QUICK_SEARCHES.map((item) => (
                            <button
                              key={item.query}
                              onClick={() => triggerQuick(item.query, item.label)}
                              className="text-xs font-poppins font-medium px-3.5 py-1.5 bg-[#f5f1e6] text-[#6c3518] rounded-full hover:bg-[#6c3518] hover:text-white transition-all duration-200"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-poppins font-semibold mb-3">
                          Browse by Concern
                        </p>
                        <ul className="space-y-2">
                          {CONCERNS.map((concern) => (
                            <li key={concern}>
                              <button
                                onClick={() => triggerQuick(concern, concern)}
                                className="flex items-center gap-2 text-sm font-poppins text-gray-600 hover:text-[#6c3518] transition-colors group"
                              >
                                <span className="w-1 h-1 rounded-full bg-[#6c3518]/30 group-hover:bg-[#6c3518] transition-colors" />
                                {concern}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Featured Products */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-poppins font-semibold mb-3">
                        Popular Products
                      </p>
                      <div className="space-y-2">
                        {(featuredProducts.length > 0 ? featuredProducts : FEATURED_HANDLES.map((f) => ({ ...f, id: f.handle, tags: [], variants: { nodes: [] }, images: { nodes: [] } } as SearchProduct))).map((product) => {
                          const image = product.images?.nodes?.[0];
                          const price = product.variants?.nodes?.[0]?.price;
                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.handle}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#faf8f3] group transition-colors duration-150"
                            >
                              <div className="w-12 h-12 rounded-lg bg-[#f5f1e6] overflow-hidden shrink-0 relative">
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
                                  <p className="text-xs font-poppins text-[#6c3518]/70 mt-0.5">
                                    {formatPrice(price.amount, price.currencyCode)}
                                  </p>
                                )}
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6c3518] group-hover:translate-x-0.5 transition-all shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── RESULTS STATE: compact scrollable list ─── */}
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

                          {/* Compact suggestion list — scrollable via parent */}
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
