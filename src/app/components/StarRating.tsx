import { Star } from "lucide-react";

interface StarRatingProps {
  /** Real average rating, 0–5. Fractions are shown exactly (4.6 fills 4.6 stars). */
  rating: number;
  size?: number;
  /** Color of the filled part. */
  fillColor?: string;
  /** Color of the empty part. */
  emptyColor?: string;
}

/**
 * Five stars filled to match `rating` exactly. Every star shown on the site
 * comes through here so what's displayed always matches the real data.
 */
export default function StarRating({
  rating,
  size = 18,
  fillColor = "#FFCE07",
  emptyColor = "#d1d5db",
}: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${clamped.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, clamped - i)); // 0..1 for this star
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} color={emptyColor} fill={emptyColor} strokeWidth={0} className="absolute inset-0" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} color={fillColor} fill={fillColor} strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
