export interface ProductFaq {
  question: string;
  answer: string;
}

// Per-product FAQ content. Add more Shopify product handles as keys; any
// handle not listed here falls back to "default".
const faqDataMap: Record<string, ProductFaq[]> = {
  // ---- PRODUCT 1 ----
  "indevie-calm-balm": [
    { question: "How do I use Calm Balm?", answer: "Apply a small amount of Calm Balm to the desired area and gently massage it in until fully absorbed. Use it as needed, typically once or twice a day, or as directed on the product packaging. For best results, apply after cleansing or before bedtime to enjoy its calming effects" },
    { question: "Is Calm Balm suitable for sensitive skin?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals." },
  ],
  // ---- PRODUCT 1 Mini ---
  "calm-balm-mini": [
    { question: "How do I use Calm Balm?", answer: "Apply a small amount of Calm Balm to the desired area and gently massage it in until fully absorbed. Use it as needed, typically once or twice a day, or as directed on the product packaging. For best results, apply after cleansing or before bedtime to enjoy its calming effects" },
    { question: "Is Calm Balm suitable for sensitive skin?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals." },
  ],
  // ---- PRODUCT 2 ----
  "indevie-kalakand-body-lotion": [
    { question: "How do I use Kalakand Skin Barrier Milk?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
    { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Can we apply both kalakand Lotion and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" },
  ],
  // ---- PRODUCT 2 MINI ----
  "kalakand-body-lotion-mini": [
    { question: "How do I use Kalakand Skin Barrier Milk?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
    { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Can we apply both kalakand Lotion and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" },
  ],
  // ---- PRODUCT 3 ----
  "indevie-glow-maalish-oil": [
    { question: "How do I use Glow Maalish Oil?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
    { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Can we apply both Kalakand Skin Barrier Milk and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" },
  ],
  // ---- PRODUCT 3 Mini ----
  "maalish-oil-mini": [
    { question: "How do I use Glow Maalish Oil?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
    { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Can we apply both Kalakand Skin Barrier Milk and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" },
  ],
  // ---- PRODUCT 4 Set ----
  "the-ultimate-care-ritual-set": [
    { question: "How do I use The Ultimate Care Ritual Set?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
    { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Can we apply both Kalakand Skin Barrier Milk and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" },
  ],
  // ---- PRODUCT 4 Set mini----
  "bodycare-gift-set": [
    { question: "How do I use The Ultimate Care Ritual Set?", answer: "Apply 4-5 pumps per body part especially hands and legs for best results." },
    { question: "Is it suitable for all body types?", answer: "Yes, unless your doctor has advised otherwise. We still recommend doing a patch test before applying on the whole body." },
    { question: "Can we apply both Kalakand Skin Barrier Milk and Glow Maalish Oil together?", answer: "Yes! You can use them together, and they actually complement each other beautifully. Apply Kalakand Skin Barrier Milk first to hydrate, soothe, and strengthen your skin barrier. Once it absorbs, follow with Glow Maalish Oil to lock in moisture, nourish the skin, and add a natural glow. This layering creates a richer, more luxurious ritual, especially at night or during dry weather." },
    { question: "Will it leave a greasy residue?", answer: "No, the lightweight formula absorbs quickly, leaving healthy and happy skin behind." },
    { question: "Is it vegan and cruelty-free?", answer: "Absolutely, made with plant-based ingredients and never tested on animals" },
  ],
  // ---- FALLBACK DEFAULT ----
  // Shows up on any product that doesn't match the specific handles above
  "default": [
    { question: "How do I incorporate this into my daily routine?", answer: "Apply a generous amount to clean, dry skin immediately after showering. Massage in upward, circular motions until fully absorbed for a radiant finish." },
    { question: "Is this suitable for deeply sensitive skin?", answer: "Absolutely. Our formula is meticulously crafted without harsh chemicals, synthetic dyes, or artificial fragrances to ensure it soothes even the most reactive skin." },
    { question: "How long will one bottle typically last?", answer: "With daily use as recommended, a single bottle typically lasts between 4 to 6 weeks, providing over a month of deep hydration." },
    { question: "Can I layer this with other active serums?", answer: "Yes, it serves as an excellent occlusive layer. Apply your lighter, water-based serums first, and use this as the final step to lock in all the active ingredients." },
    { question: "When will I begin to see noticeable results?", answer: "You will feel an immediate difference in softness and hydration upon first touch. Visibly improved skin texture and barrier repair generally occur within 14 days of consistent use." },
  ],
};

export function getProductFaqs(productHandle: string): ProductFaq[] {
  return faqDataMap[productHandle] || faqDataMap["default"];
}
