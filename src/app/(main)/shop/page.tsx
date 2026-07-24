"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCollections, fetchCollectionProducts, fetchProducts, getProductConcerns, getProductSize, ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/app/components/ProductCard";
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
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

  // Deep-link support: /shop?collection=<handle> (used by the header's mobile
  // nav) jumps straight to that collection tab instead of always landing on
  // "Shop All". Read via plain window.location rather than useSearchParams
  // so this client component doesn't need a Suspense boundary.
  useEffect(() => {
    const collectionParam = new URLSearchParams(window.location.search).get("collection");
    if (collectionParam) setActiveCollection(collectionParam);
  }, []);

  // Measure actual header height so sticky tab bar snaps flush below it
  const [headerHeight, setHeaderHeight] = useState(108);

  // Collection tab row horizontal scroll + arrow affordance
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  const updateTabsScrollState = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setCanScrollTabsLeft(el.scrollLeft > 4);
    setCanScrollTabsRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollTabsBy = (delta: number) => {
    tabsScrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Active product type filter (from the horizontal pill row)
  const [activeProductType, setActiveProductType] = useState<string>("all");

  // Filter States
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedOthers, setSelectedOthers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("relevant");

  // Mobile filter drawer: which drill-down screen is showing (root list, or one category's options)
  type MobileFilterView = "root" | "productType" | "concern" | "size" | "others" | "sort";
  const [mobileFilterView, setMobileFilterView] = useState<MobileFilterView>("root");

  // Always start at the category list whenever the drawer is (re)opened
  useEffect(() => {
    if (isMobileFilterOpen) setMobileFilterView("root");
  }, [isMobileFilterOpen]);

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

  // Re-check scroll arrow visibility whenever the tab row's content or the viewport changes
  useEffect(() => {
    updateTabsScrollState();
    window.addEventListener("resize", updateTabsScrollState);
    return () => window.removeEventListener("resize", updateTabsScrollState);
  }, [collections, updateTabsScrollState]);

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

  // Compute available filter items (with product counts) from products
  const filterOptions = useMemo(() => {
    const types = new Map<string, number>();
    const sizes = new Map<string, number>();
    const concerns = new Map<string, number>();
    const others = new Map<string, number>();
    const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) || 0) + 1);

    products.forEach((p) => {
      // 1. Product type
      const type = getProductType(p);
      if (type) bump(types, type);

      // 2. Sizes — sourced only from the real custom.size metafield.
      const size = getProductSize(p);
      if (size) bump(sizes, size);

      // 3. Concerns — sourced only from the real custom.concern metafield.
      getProductConcerns(p).forEach((concern) => bump(concerns, concern));

      // 4. Others
      const isCombo = p.tags?.some(t => t.toLowerCase().includes("combo") || t.toLowerCase().includes("set") || t.toLowerCase().includes("ritual")) || p.title.toLowerCase().includes("set");
      bump(others, isCombo ? "Combos & Sets" : "Singles");
    });

    const toSortedEntries = (map: Map<string, number>) =>
      Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return {
      productTypes: toSortedEntries(types),
      sizes: toSortedEntries(sizes),
      concerns: toSortedEntries(concerns),
      others: toSortedEntries(others),
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

    // Filter by Size — sourced only from the real custom.size metafield.
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        const size = getProductSize(p);
        return !!size && selectedSizes.includes(size);
      });
    }

    // Filter by Concern — sourced only from the real custom.concern metafield.
    if (selectedConcerns.length > 0) {
      result = result.filter((p) => getProductConcerns(p).some((concern) => selectedConcerns.includes(concern)));
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

  // Category rows shown on the mobile filter drawer's root screen — each
  // drills down into its own checkbox list, and is hidden entirely when
  // there are no options to show (e.g. no concern tags on this collection).
  const mobileFilterCategories = useMemo(() => (
    [
      { key: "productType" as const, label: "Product type", count: selectedProductTypes.length, available: filterOptions.productTypes.length > 0 },
      { key: "concern" as const, label: "Shop by Concern", count: selectedConcerns.length, available: filterOptions.concerns.length > 0 },
      { key: "size" as const, label: "Size", count: selectedSizes.length, available: filterOptions.sizes.length > 0 },
      { key: "others" as const, label: "Others", count: selectedOthers.length, available: filterOptions.others.length > 0 },
      { key: "sort" as const, label: "Sort by", count: sortBy !== "relevant" ? 1 : 0, available: true },
    ].filter((c) => c.available)
  ), [filterOptions, selectedProductTypes, selectedConcerns, selectedSizes, selectedOthers, sortBy]);

  const SORT_OPTIONS = [
    { value: "relevant", label: "Most Relevant" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "alpha", label: "Alphabetical" },
  ];

  // Shared slide transition for drill-down screens in the mobile drawer
  const drillDownMotionProps = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 16 },
    transition: { duration: 0.18, ease: "easeOut" as const },
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
  // On md+ every tab label breaks onto its own two lines regardless of word
  // length (so "Face Care" lines up with "Gifting Box" instead of sitting on
  // a single line) — on mobile the <br> stays hidden and text flows normally.
  const renderTabLabel = (label: string) => {
    const words = label.split(" ");
    return words.map((word, i) => (
      <React.Fragment key={i}>
        {i > 0 && (
          <>
            {" "}
            <br className="hidden md:inline" />
          </>
        )}
        {word}
      </React.Fragment>
    ));
  };

  const CollectionTabBar = useCallback(() => (
    <div className="max-w-[1500px] mx-auto flex items-center justify-start md:justify-end gap-6 md:gap-8 min-w-max px-1 py-1">

      {/* Shop All Tab */}
      <button
        onClick={() => { setActiveCollection("all"); clearAllFilters(); }}
        className="flex flex-col md:flex-row items-center gap-2.5 md:gap-3 group relative cursor-pointer outline-none"
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#6c3518]/30 p-0.5 transition-all duration-200 group-hover:scale-105 group-hover:border-[#6c3518]">
          <div className={`w-full h-full rounded-full flex items-center justify-center font-poppins font-bold text-[8px] sm:text-[9px] tracking-wider text-center px-1 transition-colors ${activeCollection === "all"
              ? "bg-[#6c3518] text-white border-2 border-[#6c3518]"
              : "bg-[#f5f1e6] text-[#6c3518]"
            }`}>
            SHOP ALL
          </div>
        </div>
        <span className="relative inline-flex md:w-[110px] md:justify-center">
          {activeCollection === "all" && (
            <span
              className="absolute inset-0 bg-[#6c3518]"
              style={{ clipPath: "polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)" }}
            />
          )}
          <span className={`relative z-10 px-3 py-1 text-xs sm:text-sm font-poppins font-bold uppercase tracking-wider text-center md:leading-tight transition-colors ${activeCollection === "all" ? "text-white" : "text-gray-500 group-hover:text-[#6c3518]"
            }`}>
            {renderTabLabel("Shop All")}
          </span>
        </span>
      </button>

      {/* Collection Dynamic Tabs */}
      {collections.map((col) => {
        const isActive = activeCollection === col.handle;
        const thumbnail = getCollectionThumbnail(col);
        const label = col.title.replace("Range", "").replace("Collection", "").trim();

        return (
          <button
            key={col.id}
            onClick={() => { setActiveCollection(col.handle); clearAllFilters(); }}
            className="flex flex-col md:flex-row items-center gap-2.5 md:gap-3 group relative cursor-pointer outline-none"
          >
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-16 md:h-16 rounded-full overflow-hidden p-0.5 transition-all duration-200 group-hover:scale-105 ${isActive
                ? "border-2 border-[#6c3518] shadow-[0_0_0_2px_rgba(108,53,24,0.15)]"
                : "border-2 border-[#6c3518]/20 group-hover:border-[#6c3518]/50"
              }`}>
              <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                <Image
                  src={thumbnail}
                  alt={col.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-[#6c3518]/10 rounded-full pointer-events-none" />
              )}
            </div>
            <span className="relative inline-flex max-w-[100px] md:max-w-none md:w-[110px] md:justify-center">
              {isActive && (
                <span
                  className="absolute inset-0 bg-[#6c3518]"
                  style={{ clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}
                />
              )}
              <span className={`relative z-10 px-3 py-1 text-xs sm:text-sm font-poppins font-bold uppercase tracking-wider text-center leading-tight transition-colors ${isActive ? "text-white" : "text-gray-500 group-hover:text-[#6c3518]"
                }`}>
                {renderTabLabel(label)}
              </span>
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
        className="w-full bg-white py-3.5 px-2 sm:px-10 lg:px-16 z-40"
        style={{ position: "sticky", top: headerHeight }}
      >
        <div className="relative flex items-center max-w-[1500px] mx-auto">
          {/* Left scroll arrow — shown on all screen sizes, hidden when already at the start */}
          <button
            onClick={() => scrollTabsBy(-260)}
            aria-label="Scroll collections left"
            className={`flex shrink-0 w-8 h-8 sm:w-9 sm:h-9 mr-1.5 sm:mr-2 items-center justify-center rounded-full border border-[#6c3518]/20 bg-transparent text-[#6c3518] transition-opacity hover:bg-[#6c3518]/5 ${canScrollTabsLeft ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={tabsScrollRef}
            onScroll={updateTabsScrollState}
            className="flex-1 min-w-0 overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
          >
            <CollectionTabBar />
          </div>

          {/* Right scroll arrow — shown on all screen sizes, hidden when already at the end */}
          <button
            onClick={() => scrollTabsBy(260)}
            aria-label="Scroll collections right"
            className={`flex shrink-0 w-8 h-8 sm:w-5 sm:h-9 ml-1.5 sm:ml-2 items-center justify-center rounded-full border border-[#6c3518]/20 bg-transparent text-[#6c3518] transition-opacity hover:bg-[#6c3518]/5 ${canScrollTabsRight ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
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

            {filterOptions.productTypes.map(([type]) => (
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

              {/* Section label */}
              <div className="pb-3 border-b border-[#6c3518]/15">
                <h3 className="text-sm font-poppins font-bold uppercase tracking-wider text-black">Filter:</h3>
              </div>

              {/* Product Type Filter */}
              {filterOptions.productTypes.length > 0 && (
                <div className="pb-5">
                  <h4 className="text-xs font-poppins font-bold uppercase tracking-wider text-black mb-4">Product type</h4>
                  <ul className="space-y-3">
                    {filterOptions.productTypes.map(([type, count]) => (
                      <li key={type} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`type-${type}`}
                          checked={selectedProductTypes.includes(type)}
                          onChange={() => handleTypeToggle(type)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`type-${type}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {type} <span className="text-gray-400">({count})</span>
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
                    {filterOptions.concerns.map(([concern, count]) => (
                      <li key={concern} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`concern-${concern}`}
                          checked={selectedConcerns.includes(concern)}
                          onChange={() => handleConcernToggle(concern)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`concern-${concern}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {concern} <span className="text-gray-400">({count})</span>
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
                    {filterOptions.sizes.map(([size, count]) => (
                      <li key={size} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onChange={() => handleSizeToggle(size)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`size-${size}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {size} <span className="text-gray-400">({count})</span>
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
                    {filterOptions.others.map(([other, count]) => (
                      <li key={other} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`other-${other}`}
                          checked={selectedOthers.includes(other)}
                          onChange={() => handleOtherToggle(other)}
                          className="w-4 h-4 border border-[#6c3518]/30 rounded-[2px] accent-[#6c3518] focus:ring-[#6c3518] cursor-pointer"
                        />
                        <label htmlFor={`other-${other}`} className="text-xs font-poppins text-gray-700 hover:text-black cursor-pointer uppercase font-medium">
                          {other} <span className="text-gray-400">({count})</span>
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
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

      {/* ── MOBILE: Floating Filter Button — fixed bottom-right, icon only ── */}
      <button
        onClick={() => setIsMobileFilterOpen(true)}
        aria-label="Open filters"
        className="lg:hidden fixed bottom-6 right-5 z-30 flex items-center justify-center w-14 h-14 bg-[#6c3518] text-white shadow-lg rounded-full active:scale-95 transition-transform"
      >
        <SlidersHorizontal size={20} />
        {(selectedProductTypes.length + selectedSizes.length + selectedConcerns.length + selectedOthers.length) > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-[#6c3518] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
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
              {/* Modal header — back arrow on drill-down screens, title + live product count, close */}
              <div className="relative flex items-center justify-center px-5 py-4 border-b border-gray-150 shrink-0">
                {mobileFilterView !== "root" && (
                  <button
                    onClick={() => setMobileFilterView("root")}
                    aria-label="Back to filters"
                    className="absolute left-4 p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft size={20} className="text-black" />
                  </button>
                )}
                <div className="text-center">
                  <h3 className="text-sm font-poppins font-bold uppercase tracking-wider text-black">
                    {mobileFilterView === "root"
                      ? "Filter"
                      : mobileFilterCategories.find((c) => c.key === mobileFilterView)?.label}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-poppins mt-0.5">
                    {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="Close filters"
                  className="absolute right-4 p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-black" />
                </button>
              </div>

              {/* Scrollable content — root category list, or one category's checkbox list */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait">
                  {mobileFilterView === "root" && (
                    <motion.div key="root" {...drillDownMotionProps} className="divide-y divide-gray-100">
                      {mobileFilterCategories.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setMobileFilterView(cat.key)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left active:bg-gray-50"
                        >
                          <span className="text-sm font-poppins text-gray-800">
                            {cat.label}
                            {cat.count > 0 && (
                              <span className="ml-2 text-[11px] text-[#6c3518] font-bold">({cat.count})</span>
                            )}
                          </span>
                          <ChevronRight size={16} className="text-gray-400 shrink-0" />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {mobileFilterView === "productType" && (
                    <motion.div key="productType" {...drillDownMotionProps} className="px-5 py-2 divide-y divide-gray-100">
                      {filterOptions.productTypes.map(([type, count]) => (
                        <label key={type} htmlFor={`mob-type-${type}`} className="flex items-center justify-between py-3.5 cursor-pointer">
                          <span className="text-sm font-poppins text-gray-700">
                            {type} <span className="text-gray-400">({count})</span>
                          </span>
                          <input
                            type="checkbox"
                            id={`mob-type-${type}`}
                            checked={selectedProductTypes.includes(type)}
                            onChange={() => handleTypeToggle(type)}
                            className="w-5 h-5 border border-[#6c3518]/30 rounded accent-[#6c3518] shrink-0"
                          />
                        </label>
                      ))}
                    </motion.div>
                  )}

                  {mobileFilterView === "concern" && (
                    <motion.div key="concern" {...drillDownMotionProps} className="px-5 py-2 divide-y divide-gray-100">
                      {filterOptions.concerns.map(([concern, count]) => (
                        <label key={concern} htmlFor={`mob-concern-${concern}`} className="flex items-center justify-between py-3.5 cursor-pointer">
                          <span className="text-sm font-poppins text-gray-700">
                            {concern} <span className="text-gray-400">({count})</span>
                          </span>
                          <input
                            type="checkbox"
                            id={`mob-concern-${concern}`}
                            checked={selectedConcerns.includes(concern)}
                            onChange={() => handleConcernToggle(concern)}
                            className="w-5 h-5 border border-[#6c3518]/30 rounded accent-[#6c3518] shrink-0"
                          />
                        </label>
                      ))}
                    </motion.div>
                  )}

                  {mobileFilterView === "size" && (
                    <motion.div key="size" {...drillDownMotionProps} className="px-5 py-2 divide-y divide-gray-100">
                      {filterOptions.sizes.map(([size, count]) => (
                        <label key={size} htmlFor={`mob-size-${size}`} className="flex items-center justify-between py-3.5 cursor-pointer">
                          <span className="text-sm font-poppins text-gray-700">
                            {size} <span className="text-gray-400">({count})</span>
                          </span>
                          <input
                            type="checkbox"
                            id={`mob-size-${size}`}
                            checked={selectedSizes.includes(size)}
                            onChange={() => handleSizeToggle(size)}
                            className="w-5 h-5 border border-[#6c3518]/30 rounded accent-[#6c3518] shrink-0"
                          />
                        </label>
                      ))}
                    </motion.div>
                  )}

                  {mobileFilterView === "others" && (
                    <motion.div key="others" {...drillDownMotionProps} className="px-5 py-2 divide-y divide-gray-100">
                      {filterOptions.others.map(([other, count]) => (
                        <label key={other} htmlFor={`mob-other-${other}`} className="flex items-center justify-between py-3.5 cursor-pointer">
                          <span className="text-sm font-poppins text-gray-700">
                            {other} <span className="text-gray-400">({count})</span>
                          </span>
                          <input
                            type="checkbox"
                            id={`mob-other-${other}`}
                            checked={selectedOthers.includes(other)}
                            onChange={() => handleOtherToggle(other)}
                            className="w-5 h-5 border border-[#6c3518]/30 rounded accent-[#6c3518] shrink-0"
                          />
                        </label>
                      ))}
                    </motion.div>
                  )}

                  {mobileFilterView === "sort" && (
                    <motion.div key="sort" {...drillDownMotionProps} className="px-5 py-2 divide-y divide-gray-100">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setMobileFilterView("root"); }}
                          className="w-full flex items-center justify-between py-3.5 text-left"
                        >
                          <span className="text-sm font-poppins text-gray-700">{opt.label}</span>
                          {sortBy === opt.value && <span className="w-2.5 h-2.5 rounded-full bg-[#6c3518] shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Apply Bar */}
              <div className="p-4 bg-gray-50 border-t border-gray-150 flex gap-4 shrink-0">
                <button
                  onClick={() => { clearAllFilters(); setMobileFilterView("root"); }}
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
