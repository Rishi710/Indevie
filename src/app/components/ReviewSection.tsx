"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Review {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewer: {
    name: string;
    verified_buyer: boolean;
  };
  created_at: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isWriting, setIsWriting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    age: "",
    rating: 5,
    body: "",
  });

  // Extract the numeric ID from the global Shopify ID (gid://shopify/Product/12345)
  const externalId = productId.split("/").pop();

  useEffect(() => {
    if (!externalId) return;

    fetch(`/api/reviews?productId=${externalId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.total || 0);
      })
      .catch((err) => console.error("Failed to fetch reviews:", err))
      .finally(() => setIsLoading(false));
  }, [externalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: externalId,
          reviewBody: formData.body,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsWriting(false);
          setSubmitSuccess(false);
          setFormData({ name: "", email: "", location: "", age: "", rating: 5, body: "" });
        }, 5000);
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "submit"}
            disabled={!interactive}
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={`transition-colors ${
              interactive ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
          >
            <Star
              size={interactive ? 24 : 16}
              fill={star <= rating ? "#6c3518" : "transparent"}
              className={star <= rating ? "text-[#6c3518]" : "text-gray-300"}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full mt-12 py-10 border-t border-[#e5e5e5]/50 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-2xl font-poppins italic text-[#2a2a2a] mb-3">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            {renderStars(Math.round(averageRating))}
            <p className="text-sm text-gray-500 font-medium">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} based on {totalReviews} Reviews
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsWriting(!isWriting)}
          className="bg-[#6c3518] text-white px-6 py-3 rounded-[8px] text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors"
        >
          {isWriting ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {isWriting && (
        <div className="bg-white p-6 md:p-8 rounded-[14px] border border-[#e5e5e5] mb-12 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          {submitSuccess ? (
            <div className="text-center py-10 text-[#6c3518]">
              <h3 className="text-xl font-serif italic mb-2">Thank you!</h3>
              <p>Your review has been securely submitted and is pending approval.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="text-lg text-[#2a2a2a] font-medium border-b border-[#e5e5e5] pb-3">
                Rate & Review
              </h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
                  Overall Rating
                </label>
                {renderStars(formData.rating, true)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border border-[#e5e5e5] rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#6c3518] transition-colors bg-[#f5f1e6]/40"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Email (Gmail)</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border border-[#e5e5e5] rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#6c3518] transition-colors bg-[#f5f1e6]/40"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Location</label>
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border border-[#e5e5e5] rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#6c3518] transition-colors bg-[#f5f1e6]/40"
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Age</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="border border-[#e5e5e5] rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#6c3518] transition-colors bg-[#f5f1e6]/40"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Review</label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="border border-[#e5e5e5] rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#6c3518] transition-colors bg-[#f5f1e6]/40 resize-none"
                  placeholder="Write your comments here..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-6 py-4 rounded-[8px] text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[#6c3518] transition-colors mt-2 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="w-full py-16 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#6c3518] rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-[#e5e5e5]/20 rounded-[14px]">
          <p className="text-gray-500 mb-4">Make the first move. Let us know how this product feels.</p>
          <button 
             onClick={() => setIsWriting(true)}
             className="text-[#6c3518] underline font-medium hover:text-black transition-colors"
          >
            Be the first to review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => {
            // Parse out the embedded location & age string
            const metaRegex = /\n\n---\n🌍 Location: (.*?)\n👤 Age: (.*)$/;
            const match = review.body.match(metaRegex);
            
            let cleanBody = review.body;
            let location = "";
            let age = "";

            if (match) {
              cleanBody = review.body.replace(match[0], "");
              location = match[1] !== 'N/A' ? match[1] : "";
              age = match[2] !== 'N/A' ? match[2] : "";
            }

            return (
              <div key={review.id} className="bg-white p-6 rounded-[14px] border border-[#e5e5e5]/80 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start mb-1">
                   {renderStars(review.rating)}
                   <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                   </span>
                </div>
                {review.title && (
                  <h4 className="font-semibold text-[15px] text-[#2a2a2a] leading-tight flex flex-col">
                    {review.title}
                  </h4>
                )}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2 whitespace-pre-wrap">
                  {cleanBody}
                </p>
                <div className="text-xs text-gray-500 font-medium border-t border-[#e5e5e5]/50 pt-3 mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[#6c3518] font-semibold">{review.reviewer.name}</span>
                    {(location || age) && (
                      <span className="text-[#777] font-normal text-[11px] mt-0.5">
                        {location}{location && age ? " | " : ""}{age}{age ? " yo" : ""}
                      </span>
                    )}
                  </div>
                  {review.reviewer.verified_buyer && (
                    <span className="bg-[#6c3518]/10 text-[#6c3518] px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
