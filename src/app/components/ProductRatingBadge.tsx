"use client";

import { useEffect, useState } from "react";
import { fetchReviews } from "@/lib/reviewsClient";
import StarRating from "./StarRating";

interface ProductRatingBadgeProps {
  productId: string;
}

/**
 * Star rating under the product title. Shows only the real Judge.me average and
 * review count; a product with no reviews shows nothing at all.
 */
export default function ProductRatingBadge({ productId }: ProductRatingBadgeProps) {
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Extract numeric ID
  const externalId = productId.split("/").pop();

  useEffect(() => {
    if (!externalId) return;

    fetchReviews(externalId)
      .then((data) => {
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.total || 0);
      })
      .catch((err) => console.error("Failed to fetch badge rating:", err));
  }, [externalId]);

  if (totalReviews === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={averageRating} size={18} />
      <span className="text-[16px] sm:text-[17px] text-[#1a1a1a] font-normal">
        {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}
