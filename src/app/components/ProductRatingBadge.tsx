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

  if (isLoading || totalReviews === 0) return null; // Don't show anything if no reviews yet

  const roundedRating = Math.round(averageRating);

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= roundedRating ? "#FFD700" : "transparent"}
            color={star <= roundedRating ? "#FFD700" : "#d1d5db"} // Golden #FFD700
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">({totalReviews})</span>
    </div>
  );
}
