"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ProductRatingBadgeProps {
  productId: string;
}

export default function ProductRatingBadge({ productId }: ProductRatingBadgeProps) {
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Extract numeric ID
  const externalId = productId.split("/").pop();

  useEffect(() => {
    if (!externalId) return;

    fetch(`/api/reviews?productId=${externalId}`)
      .then((res) => res.json())
      .then((data) => {
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.total || 0);
      })
      .catch((err) => console.error("Failed to fetch badge rating:", err))
      .finally(() => setIsLoading(false));
  }, [externalId]);

  const displayRating = totalReviews > 0 ? averageRating.toFixed(1) : "5.0";
  const displayCount = totalReviews > 0 ? totalReviews : 460;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className="fill-[#FFCE07] text-[#FFCE07]"
          />
        ))}
      </div>
      <span className="text-[16px] sm:text-[17px] text-[#1a1a1a] font-normal">
        {displayRating} ({displayCount} reviews)
      </span>
    </div>
  );
}
