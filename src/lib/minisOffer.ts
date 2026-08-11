/**
 * Travel Minis Offer Utility
 *
 * Tier 1: Buy 2 Travel Minis -> Get 5% OFF
 * Tier 2: Buy 4 (or more) Travel Minis -> Get 10% OFF
 *
 * Applicable to products tagged with 'mini', 'travel-mini', 'travel',
 * in the 'travel-minis' collection, or having 'mini' in product title / productType.
 */

export interface MiniOfferLineItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalOriginalPrice: number;
  title: string;
  isMini: boolean;
}

export interface MinisOfferResult {
  totalMinisCount: number;
  minisOriginalSubtotal: number;
  minisOfferTotal: number;
  discountAmount: number;
  discountPercent: number;
  currentTier: "none" | "1_mini" | "2_minis" | "3_minis" | "4_plus";
  progressPercent: number;
  bannerMessage: string;
  badgeMessage: string | null;
  targetCountForNextTier: number;
  itemsNeededForNextTier: number;
  hasOfferApplied: boolean;
}

/**
 * Determines whether a product qualifies as a Travel Mini.
 */
export function isTravelMini(product: any): boolean {
  if (!product) return false;

  // 1. Check product tags
  const tags: string[] = product.tags || [];
  const normalizedTags = tags.map((t) => t.toLowerCase().trim());
  if (
    normalizedTags.some((t) =>
      ["mini", "travel-mini", "travel mini", "travel minis", "travel"].includes(t)
    )
  ) {
    return true;
  }

  // 2. Check collections
  const collections = product.collections?.nodes || [];
  if (
    collections.some((c: any) =>
      ["travel-minis", "travel-mini", "minis", "travel-collection"].includes(
        c.handle?.toLowerCase()
      )
    )
  ) {
    return true;
  }

  // 3. Check product title or productType
  const title = (product.title || "").toLowerCase();
  const productType = (product.productType || "").toLowerCase();

  if (title.includes("mini") || productType.includes("mini") || title.includes("travel")) {
    return true;
  }

  return false;
}

/**
 * Calculates the travel mini offer progress, percentage discount tiers, and savings.
 */
export function calculateMinisOffer(lines: any[] = []): MinisOfferResult {
  const defaultEmpty: MinisOfferResult = {
    totalMinisCount: 0,
    minisOriginalSubtotal: 0,
    minisOfferTotal: 0,
    discountAmount: 0,
    discountPercent: 0,
    currentTier: "none",
    progressPercent: 0,
    bannerMessage: "Travel Minis Offer: Buy 2 for 5% OFF | Buy 4 for 10% OFF",
    badgeMessage: null,
    targetCountForNextTier: 2,
    itemsNeededForNextTier: 2,
    hasOfferApplied: false,
  };

  if (!lines || lines.length === 0) {
    return defaultEmpty;
  }

  let totalMinisCount = 0;
  let minisOriginalSubtotal = 0;

  lines.forEach((line) => {
    const merchandise = line.merchandise;
    const product = merchandise?.product;
    if (isTravelMini(product)) {
      const quantity = line.quantity || 1;
      const price = parseFloat(merchandise?.price?.amount || "0");
      totalMinisCount += quantity;
      minisOriginalSubtotal += price * quantity;
    }
  });

  if (totalMinisCount === 0) {
    return defaultEmpty;
  }

  // Determine percentage discount tier
  let discountPercent = 0;
  let currentTier: MinisOfferResult["currentTier"] = "none";
  let progressPercent = 0;
  let bannerMessage = "";
  let badgeMessage: string | null = null;
  let targetCountForNextTier = 2;
  let itemsNeededForNextTier = 2;

  if (totalMinisCount === 1) {
    discountPercent = 0;
    currentTier = "1_mini";
    progressPercent = 50; // 1 of 2 for 5% OFF
    targetCountForNextTier = 2;
    itemsNeededForNextTier = 1;
    bannerMessage = "Add 1 more Mini to get 5% OFF!";
    badgeMessage = "Add 1 more for 5% OFF";
  } else if (totalMinisCount === 2) {
    discountPercent = 5;
    currentTier = "2_minis";
    progressPercent = 50; // 2 of 4 for 10% OFF
    targetCountForNextTier = 4;
    itemsNeededForNextTier = 2;
    bannerMessage = "🎉 You unlocked 5% OFF on Minis! Add 2 more to get 10% OFF!";
    badgeMessage = "5% OFF Applied";
  } else if (totalMinisCount === 3) {
    discountPercent = 5;
    currentTier = "3_minis";
    progressPercent = 75; // 3 of 4 for 10% OFF
    targetCountForNextTier = 4;
    itemsNeededForNextTier = 1;
    bannerMessage = "Add 1 more Mini to get 10% OFF!";
    badgeMessage = "5% OFF (Add 1 more for 10% OFF)";
  } else {
    // 4 or more minis
    discountPercent = 10;
    currentTier = "4_plus";
    progressPercent = 100;
    targetCountForNextTier = totalMinisCount;
    itemsNeededForNextTier = 0;
    bannerMessage = `🎉 Best Value! 10% OFF Applied on all ${totalMinisCount} Minis!`;
    badgeMessage = "10% OFF Applied";
  }

  const rawDiscount = minisOriginalSubtotal * (discountPercent / 100);
  const discountAmount = Math.round(rawDiscount);
  const minisOfferTotal = Math.round(minisOriginalSubtotal - discountAmount);
  const hasOfferApplied = discountAmount > 0;

  return {
    totalMinisCount,
    minisOriginalSubtotal: Math.round(minisOriginalSubtotal),
    minisOfferTotal,
    discountAmount,
    discountPercent,
    currentTier,
    progressPercent,
    bannerMessage,
    badgeMessage,
    targetCountForNextTier,
    itemsNeededForNextTier,
    hasOfferApplied,
  };
}
