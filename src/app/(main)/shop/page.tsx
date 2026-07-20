"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCollections, fetchCollectionProducts, fetchProducts, ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/app/components/ProductCard";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CollectionItem {
  id: string;
  title: string;
  handle: string;
  image?: { url: string } | null;
}

// Derives a product's display "type" — the single source of truth used both
// when building the filter option list and when applying filters, so a
// product can never be miscategorized between the two.
function getProductType(p: ShopifyProduct): string | null {
  if (p.productType) return p.productType;
  const title = p.title.toLowerCase();
  if (title.includes("mist")) return "Face Mist";
  if (title.includes("sunshield") || title.includes("sunscreen")) return "Sunscreen";
  if (title.includes("calm balm")) return "Body Balm";
  if (title.includes("lotion")) return "Body Lotion";
  if (title.includes("oil")) return "Body Oil";
  if (title.includes("set") || title.includes("ritual")) return "Gift Set";
  return null;
}

export default function ShopPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Measure actual header height so sticky tab bar snaps flush below it
  const [headerHeight, setHeaderHeight] = useState(108);

  // Active product type filter (from the horizontal pill row)
  const [activeProductType, setActiveProductType] = useState<string>("all");

  // Filter States
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedOthers, setSelectedOthers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("relevant");

  // Dynamically measure header height so sticky top is always accurate
  useEffect(() => {
    const measureHeader = () => {
      const headerEl =
        (document.querySelector("[data-header-wrapper]") as HTMLElement | null) ||
        (document.querySelector("header")?.parentElement as HTMLElement | null);
      if (headerEl) setHeaderHeight(headerEl.getBoundingClientRect().height);
    };
    measureHeader();
    const ro = new ResizeObserver(measureHeader);
    const headerEl =
      (document.querySelector("[data-header-wrapper]") as HTMLElement | null) ||
      (document.querySelector("header")?.parentElement as HTMLElement | null);
    if (headerEl) ro.observe(headerEl);
    return () => ro.disconnect();
  }, []);

  // Fetch collections and products on load
  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);
        const fetchedCollections = await fetchCollections();
        // Exclude system collections
        const cleanCollections = fetchedCollections.filter(
          (c) => !["frontpage", "homepage"].includes(c.handle.toLowerCase())
        );
        setCollections(cleanCollections);

        // Fetch all products to construct "Shop All"
        const compiledProducts = await fetchProducts(100);

        const preferredHandles = [
          "geeli-mitti-face-mist",
          "gulkand-face-mist",
          "gulaab-tez-dhoop-sunshield-ayurvedic-spf-50-pa-sunscreen",
          "indevie-calm-balm"
        ];
        const preferred = preferredHandles
          .map(h => compiledProducts.find(p => p.handle === h))
          .filter(Boolean) as ShopifyProduct[];
        const others = compiledProducts.filter(p => !preferredHandles.includes(p.handle));
        const sortedAll = [...preferred, ...others];

        setAllProducts(sortedAll);
        setProducts(sortedAll);
      } catch (error) {
        console.error("Error loading shop catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, []);

  // Fetch products for a specific collection when activeCollection changes
  useEffect(() => {
    setActiveProductType("all"); // Reset type filter on collection change

    if (activeCollection === "all") {
      setProducts(allProducts);
      return;
    }

    let cancelled = false;

    const loadCollectionProducts = async () => {
      try {
        setLoading(true);
        const colData = await fetchCollectionProducts(activeCollection, 50);
        // Ignore this response if activeCollection changed again while it was in flight
        if (!cancelled && colData) {
          setProducts(colData.products);
        }
      } catch (error) {
        if (!cancelled) console.error("Error loading collection products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCollectionProducts();

    return () => {
      cancelled = true;
    };
  }, [activeCollection, allProducts]);

  // Compute available filter items from products
  const filterOptions = useMemo(() => {
    const types = new Set<string>();
    const sizes = new Set<string>();
    const concerns = new Set<string>();
    const others = new Set<string>();

    products.forEach((p) => {
      // 1. Product type
      const type = getProductType(p);
      if (type) types.add(type);

      // 2. Sizes
      const hasMini = p.tags?.some(t => t.toLowerCase().includes("mini")) || p.title.toLowerCase().includes("mini");
      const sizeTag30ml = p.tags?.some(t => t.toLowerCase().includes("30ml")) || p.title.toLowerCase().includes("30ml");
      const sizeTag50gm = p.tags?.some(t => t.toLowerCase().includes("50gm")) || p.title.toLowerCase().includes("50gm");

      if (hasMini) {
        sizes.add("Mini Size");
      } else if (sizeTag30ml || sizeTag50gm || p.title.toLowerCase().includes("lotion") || p.title.toLowerCase().includes("oil")) {
        sizes.add("Full Size");
      } else {
        sizes.add("Standard Size");
      }

      // 3. Concerns
      const productTags = p.tags || [];
      let foundExplicitConcern = false;

      productTags.forEach((tag) => {
        if (tag.toLowerCase().startsWith("concern:")) {
          concerns.add(tag.split(":")[1].trim());
          foundExplicitConcern = true;
        }
      });

      if (!foundExplicitConcern) {
        const titleLower = p.title.toLowerCase();
        if (titleLower.includes("sunshield") || titleLower.includes("sunscreen")) concerns.add("Sun Protection");
        if (titleLower.includes("mist") || titleLower.includes("lotion")) concerns.add("Deep Hydration");
        if (titleLower.includes("oil") || titleLower.includes("gulkand")) concerns.add("Skin Glow");
        if (titleLower.includes("calm balm") || titleLower.includes("mitti")) concerns.add("Calming & Soothing");
      }

      // 4. Others
      const isCombo = p.tags?.some(t => t.toLowerCase().includes("combo") || t.toLowerCase().includes("set") || t.toLowerCase().includes("ritual")) || p.title.toLowerCase().includes("set");
      if (isCombo) {
        others.add("Combos & Sets");
      } else {
        others.add("Singles");
      }
    });

    return {
      productTypes: Array.from(types).sort(),
      sizes: Array.from(sizes).sort(),
      concerns: Array.from(concerns).sort(),
      others: Array.from(others).sort(),
    };
  }, [products]);

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by product type pill
    if (activeProductType !== "all") {
      result = result.filter((p) => getProductType(p) === activeProductType);
    }

    // Filter by Product Type (sidebar checkboxes)
    if (selectedProductTypes.length > 0) {
      result = result.filter((p) => {
        const type = getProductType(p);
        return !!type && selectedProductTypes.includes(type);
      });
    }

    // Filter by Size
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        const hasMini = p.tags?.some(t => t.toLowerCase().includes("mini")) || p.title.toLowerCase().includes("mini");
        const sizeTag30ml = p.tags?.some(t => t.toLowerCase().includes("30ml")) || p.title.toLowerCase().includes("30ml");
        const sizeTag50gm = p.tags?.some(t => t.toLowerCase().includes("50gm")) || p.title.toLowerCase().includes("50gm");
        const size = hasMini ? "Mini Size" : (sizeTag30ml || sizeTag50gm || p.title.toLowerCase().includes("lotion") || p.title.toLowerCase().includes("oil") ? "Full Size" : "Standard Size");
        return selectedSizes.includes(size);
      });
    }

    // Filter by Concern
    if (selectedConcerns.length > 0) {
      result = result.filter((p) => {
        const productTags = p.tags || [];
        const concernsList: string[] = [];

        productTags.forEach((tag) => {
          if (tag.toLowerCase().startsWith("concern:")) {
            concernsList.push(tag.split(":")[1].trim());
          }
        });

        if (concernsList.length === 0) {
          const titleLower = p.title.toLowerCase();
          if (titleLower.includes("sunshield") || titleLower.includes("sunscreen")) concernsList.push("Sun Protection");
          if (titleLower.includes("mist") || titleLower.includes("lotion")) concernsList.push("Deep Hydration");
          if (titleLower.includes("oil") || titleLower.includes("gulkand")) concernsList.push("Skin Glow");
          if (titleLower.includes("calm balm") || titleLower.includes("mitti")) concernsList.push("Calming & Soothing");
        }

        return concernsList.some(concern => selectedConcerns.includes(concern));
      });
    }

    // Filter by Others
    if (selectedOthers.length > 0) {
      result = result.filter((p) => {
        const isCombo = p.tags?.some(t => t.toLowerCase().includes("combo") || t.toLowerCase().includes("set") || t.toLowerCase().includes("ritual")) || p.title.toLowerCase().includes("set");
        const category = isCombo ? "Combos & Sets" : "Singles";
        return selectedOthers.includes(category);
      });
    }

    // Apply Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => parseFloat(a.variants.nodes[0]?.price?.amount || "0") - parseFloat(b.variants.nodes[0]?.price?.amount || "0"));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => parseFloat(b.variants.nodes[0]?.price?.amount || "0") - parseFloat(a.variants.nodes[0]?.price?.amount || "0"));
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [products, activeProductType, selectedProductTypes, selectedSizes, selectedConcerns, selectedOthers, sortBy]);

  // Toggle Filters
  const handleTypeToggle = (type: string) => {
    setSelectedProductTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleConcernToggle = (concern: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const handleOtherToggle = (other: string) => {
    setSelectedOthers(prev =>
      prev.includes(other) ? prev.filter(o => o !== other) : [...prev, other]
    );
  };

  const clearAllFilters = () => {
    setSelectedProductTypes([]);
    setSelectedSizes([]);
    setSelectedConcerns([]);
    setSelectedOthers([]);
    setActiveProductType("all");
  };

  // Find thumbnail for collections
  const getCollectionThumbnail = (col: CollectionItem) => {
    if (col.image?.url) return col.image.url;
    return "https://cdn.shopify.com/s/files/1/0649/7301/3058/files/logo_3.webp?v=1778164066";
  };

  // Active collection display name
  const activeCollectionName = useMemo(() => {
    if (activeCollection === "all") return "All Products";
    const col = collections.find(c => c.handle === activeCollection);
    return col ? col.title.replace("Range", "").replace("Collection", "").trim() : "Products";
  }, [activeCollection, collections]);

  // The pill tab bar JSX
  const CollectionTabBar = useCallback(() => (
    <div className="max-w-[1500px] mx-auto flex items-center justify-start md:justify-center gap-5 md:gap-10 min-w-max">

      {/* Shop All Tab */}
      <button
        onClick={() => { setActiveCollection("all"); clearAllFilters(); }}
        className="flex flex-col items-center gap-1.5 group relative cursor-pointer outline-none"
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#6c3518]/30 p-0.5 transition-all duration-200 group-hover:scale-105 group-hover:border-[#6c3518]">
          <div className={`w-full h-full rounded-full flex items-center justify-center font-poppins font-bold text-[7px] tracking-wider text-center px-1 transition-colors ${activeCollection === "all"
              ? "bg-[#6c3518] text-white border-2 border-[#6c3518]"
              : "bg-[#f5f1e6] text-[#6c3518]"
            }`}>
            SHOP ALL
          </div>
        </div>
        <span className={`text-[9px] font-poppins font-bold uppercase tracking-wider transition-colors ${activeCollection === "all" ? "text-[#6c3518]" : "text-gray-400 group-hover:text-[#6c3518]"
          }`}>
          Shop All
        </span>
      </button>

      {/* Collection Dynamic Tabs */}
      {collections.map((col) => {
        const isActive = activeCollection === col.handle;
        const thumbnail = getCollectionThumbnail(col);

        return (
          <button
            key={col.id}
            onClick={() => { setActiveCollection(col.handle); clearAllFilters(); }}
            className="flex flex-col items-center gap-1.5 group relative cursor-pointer outline-none"
          >
            <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 transition-all duration-200 group-hover:scale-105 ${isActive
                ? "border-2 border-[#6c3518] shadow-[0_0_0_2px_rgba(108,53,24,0.15)]"
                : "border-2 border-[#6c3518]/20 group-hover:border-[#6c3518]/50"
              }`}>
              <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                <Image
                  src={thumbnail}
                  alt={col.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-[#6c3518]/10 rounded-full pointer-events-none" />
              )}
            </div>
            <span className={`text-[9px] font-poppins font-bold uppercase tracking-wider transition-colors max-w-[70px] text-center leading-tight ${isActive ? "text-[#6c3518]" : "text-gray-400 group-hover:text-[#6c3518]"
              }`}>
              {col.title.replace("Range", "").replace("Collection", "").trim()}
            </span>
          </button>
        );
      })}
    </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [collections, activeCollection]);

  return (
    <main className="relative min-h-screen bg-white overflow-x-clip">

      {/* 🌿 HERO SECTION — transparent header floats over it, so no paddingTop needed */}
      <section className="relative w-full overflow-hidden">
        <div
          className="relative w-full h-[55vh] md:h-[80vh] z-0"
          style={{
            backgroundImage: "url('/images/DSC_6451.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          {/* Soft Overlay */}
          <div className="absolute inset-0 bg-[#6c3518]/25" />

          {/* Hero Content — centered with top padding to clear the fixed header visually */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6" style={{ paddingTop: headerHeight }}>
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <h1 className="text-4xl md:text-7xl font-serif italic text-white mb-4 drop-shadow-2xl font-light">
                The Ritual Library
              </h1>
              <p className="text-white/95 text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-light max-w-lg mx-auto leading-loose drop-shadow-md">
                Curated botanical treasures for your daily sanctuary.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STICKY COLLECTION TAB BAR ── */}
      <div
        className="w-full bg-white py-3.5 px-4 sm:px-10 lg:px-16 overflow-x-auto [&::-webkit-scrollbar]:hidden z-40"
        style={{ position: "sticky", top: headerHeight }}
      >
        <CollectionTabBar />
      </div>

      {/* PRODUCT TYPE PILL ROW — horizontal scrollable filter strip */}
      {filterOptions.productTypes.length > 0 && (
        <div className="w-full bg-white border-b border-gray-100 px-4 sm:px-10 lg:px-16 py-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <div className="max-w-[1500px] mx-auto flex items-center justify-start md:justify-center gap-2.5 min-w-max">
            {/* All pill */}
            <button
              onClick={() => setActiveProductType("all")}
              className={`px-5 py-2 rounded-full text-[11px] font-poppins font-bold uppercase tracking-wider border transition-all duration-200 whitespace-nowrap cursor-pointer ${activeProductType === "all"
                  ? "bg-[#6c3518] text-white border-[#6c3518]"
                  : "bg-transparent text-[#6c3518] border-[#6c3518]/40 hover:border-[#6c3518] hover:bg-[#6c3518]/5"
                }`}
            >
              All
            </button>

            {filterOptions.productTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveProductType(activeProductType === type ? "all" : type)}
                className={`px-5 py-2 rounded-full text-[11px] font-poppins font-bold uppercase tracking-wider border transition-all duration-200 whitespace-nowrap cursor-pointer ${activeProductType === type
                    ? "bg-[#6c3518] text-white border-[#6c3518]"
                    : "bg-transparent text-[#6c3518] border-[#6c3518]/40 hover:border-[#6c3518] hover:bg-[#6c3518]/5"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CATALOG MAIN CONTENT */}
      <section className="relative z-20 bg-white py-8">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-16">

          <div className="flex flex-col lg:flex-row gap-10">

            {/* 1. FILTER SIDEBAR — Desktop only */}
            <aside className="hidden lg:block w-[220px] shrink-0 space-y-6 sticky self-start" style={{ top: headerHeight + 16 }}>

              {/* Product Type Filter */}
              {filterOptions.productTypes.length > 0 && (
                <div className="pb-5">
                  <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-black mb-4">Product type</h4>
                  <ul className="space-y-3">
                    {filterOptions.productTypes.map((type) => (
                      <li key={type} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={selectedProductTypes.includes(type)}
                          onChange={() => handleTypeToggle(type)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`type-${type}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {type}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Shop by Concern Filter */}
              {filterOptions.concerns.length > 0 && (
                <div className="pb-5">
                  <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-black mb-4">Shop by Concern</h4>
                  <ul className="space-y-3">
                    {filterOptions.concerns.map((concern) => (
                      <li key={concern} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`concern-${concern}`}
                          checked={selectedConcerns.includes(concern)}
                          onChange={() => handleConcernToggle(concern)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`concern-${concern}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {concern}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Size Filter */}
              {filterOptions.sizes.length > 0 && (
                <div className="pb-5">
                  <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-black mb-4">Size</h4>
                  <ul className="space-y-3">
                    {filterOptions.sizes.map((size) => (
                      <li key={size} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onChange={() => handleSizeToggle(size)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`size-${size}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {size}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Others Filter */}
              {filterOptions.others.length > 0 && (
                <div className="pb-5">
                  <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-black mb-4">Others</h4>
                  <ul className="space-y-3">
                    {filterOptions.others.map((other) => (
                      <li key={other} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`other-${other}`}
                          checked={selectedOthers.includes(other)}
                          onChange={() => handleOtherToggle(other)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`other-${other}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {other}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sort By Filter */}
              <div>
                <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-black mb-3">Sort by</h4>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white border border-[#6c3518] text-[#6c3518] rounded-[4px] px-3 py-2.5 text-xs font-poppins uppercase font-bold outline-none cursor-pointer appearance-none"
                  >
                    <option value="relevant">Most Relevant</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="alpha">Alphabetical</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6c3518]" />
                </div>
              </div>

              {/* Clear filters shortcut */}
              {(selectedProductTypes.length > 0 || selectedSizes.length > 0 || selectedConcerns.length > 0 || selectedOthers.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 bg-white hover:bg-[#6c3518] hover:text-white border border-[#6c3518] rounded-[4px] text-[10px] font-poppins font-bold uppercase tracking-wider transition-colors duration-200 text-[#6c3518]"
                >
                  Clear Filters
                </button>
              )}

            </aside>

            {/* 2. PRODUCT GRID SECTION */}
            <div className="flex-1 space-y-6">

              {/* Dynamic Collection Heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCollection + activeProductType}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-start text-left pb-6 md:pb-8"
                >
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#6c3518] font-light tracking-wide leading-tight">
                    {activeProductType !== "all"
                      ? activeProductType
                      : activeCollectionName}
                  </h2>
                  <div className="w-14 h-[1.5px] bg-[#6c3518]/25 mt-3" />
                </motion.div>
              </AnimatePresence>

              {loading ? (
                /* Loading Skeleton */
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-3 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                      <div className="aspect-square bg-gray-100" />
                      <div className="h-3 bg-gray-100 mx-3 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 mx-3 rounded w-1/2" />
                      <div className="h-8 bg-gray-100 mx-3 mb-3 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedProducts.length > 0 ? (
                /* Real Grid Card mapping */
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {filteredAndSortedProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.5) }}
                      className="h-full"
                    >
                      <ProductCard product={product} priority={idx < 4} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-[#6c3518]/20">
                  <p className="text-sm font-poppins text-gray-500 italic">No products match your filter selection.</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-6 py-2.5 bg-[#6c3518] text-white text-xs font-poppins font-bold uppercase tracking-wider rounded-[4px] hover:bg-black transition-colors"
                  >
                    Clear Filter Checkboxes
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ── MOBILE: Floating Filter Button — fixed bottom-right ── */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center gap-2 bg-[#6c3518] text-white shadow-lg px-5 py-3 rounded-full font-poppins font-bold text-[11px] uppercase tracking-wider active:scale-95 transition-transform"
      >
        <SlidersHorizontal size={15} />
        Filters
        {(selectedProductTypes.length + selectedSizes.length + selectedConcerns.length + selectedOthers.length) > 0 && (
          <span className="ml-0.5 bg-white text-[#6c3518] rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
            {selectedProductTypes.length + selectedSizes.length + selectedConcerns.length + selectedOthers.length}
          </span>
        )}
      </button>

      {/* 3. MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[1000] lg:hidden"
            />

            {/* Slide up panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl z-[1010] flex flex-col lg:hidden border-t border-[#6c3518] overflow-hidden shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-150">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#6c3518]" />
                  <h3 className="text-sm font-poppins font-bold uppercase tracking-wider text-black">Filter By</h3>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-black" />
                </button>
              </div>

              {/* Scrollable list options */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* Product Type checkboxes */}
                {filterOptions.productTypes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-[#6c3518] mb-3">Product type</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {filterOptions.productTypes.map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`mob-type-${type}`}
                            checked={selectedProductTypes.includes(type)}
                            onChange={() => handleTypeToggle(type)}
                            className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518]"
                          />
                          <label htmlFor={`mob-type-${type}`} className="text-xs font-poppins text-gray-700 uppercase font-medium">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shop by Concern checkboxes */}
                {filterOptions.concerns.length > 0 && (
                  <div>
                    <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-[#6c3518] mb-3">Shop by Concern</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {filterOptions.concerns.map((concern) => (
                        <div key={concern} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`mob-concern-${concern}`}
                            checked={selectedConcerns.includes(concern)}
                            onChange={() => handleConcernToggle(concern)}
                            className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518]"
                          />
                          <label htmlFor={`mob-concern-${concern}`} className="text-xs font-poppins text-gray-700 uppercase font-medium">
                            {concern}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size checkboxes */}
                {filterOptions.sizes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-[#6c3518] mb-3">Size</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {filterOptions.sizes.map((size) => (
                        <div key={size} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`mob-size-${size}`}
                            checked={selectedSizes.includes(size)}
                            onChange={() => handleSizeToggle(size)}
                            className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518]"
                          />
                          <label htmlFor={`mob-size-${size}`} className="text-xs font-poppins text-gray-700 uppercase font-medium">
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Others checkboxes */}
                {filterOptions.others.length > 0 && (
                  <div>
                    <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-[#6c3518] mb-3">Others</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {filterOptions.others.map((other) => (
                        <div key={other} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`mob-other-${other}`}
                            checked={selectedOthers.includes(other)}
                            onChange={() => handleOtherToggle(other)}
                            className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518]"
                          />
                          <label htmlFor={`mob-other-${other}`} className="text-xs font-poppins text-gray-700 uppercase font-medium">
                            {other}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort selector */}
                <div>
                  <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-[#6c3518] mb-3">Sort by</h4>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border border-[#6c3518] text-[#6c3518] rounded-[4px] px-3 py-2.5 text-xs font-poppins uppercase font-bold outline-none"
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="alpha">Alphabetical</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6c3518]" />
                  </div>
                </div>

              </div>

              {/* Bottom Apply Bar */}
              <div className="p-4 bg-gray-50 border-t border-gray-150 flex gap-4">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border border-[#6c3518] text-xs font-poppins font-bold uppercase tracking-wider rounded-[4px] bg-white text-[#6c3518] active:bg-[#f5f1e6]"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-[#6c3518] text-white text-xs font-poppins font-bold uppercase tracking-wider rounded-[4px] active:bg-black transition-colors"
                >
                  Apply Filters
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
