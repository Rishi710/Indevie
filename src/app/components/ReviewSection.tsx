"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, ImagePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchReviews } from "@/lib/reviewsClient";
import {
  MAX_REVIEW_PHOTOS,
  arePhotoUploadsEnabled,
  compressReviewPhoto,
  uploadReviewPhoto,
} from "@/lib/reviewPhotos";
import StarRating from "./StarRating";

interface ReviewPicture {
  thumb: string;
  full: string;
}

interface Review {
  id: number;
  title: string | null;
  body: string;
  rating: number;
  reviewer: {
    name: string;
  };
  created_at: string;
  pictures?: ReviewPicture[];
}

interface PendingPhoto {
  id: string;
  blob: Blob;
  previewUrl: string;
}

interface ReviewSectionProps {
  productId: string;
}

/** Reviews shown at first, and added each time "Show more" is pressed. */
const REVIEWS_PER_PAGE = 12; // divides evenly into the 3- and 4-column grids

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const [isWriting, setIsWriting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    body: "",
  });

  // Optional photos: only offered when the store has somewhere to keep them.
  const [photosEnabled, setPhotosEnabled] = useState(false);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lightbox, setLightbox] = useState<{ pictures: ReviewPicture[]; index: number } | null>(null);

  // Extract the numeric ID from the global Shopify ID (gid://shopify/Product/12345)
  const externalId = productId.split("/").pop();

  useEffect(() => {
    if (!externalId) return;

    fetchReviews(externalId)
      .then((data) => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.total || 0);
      })
      .catch((err) => console.error("Failed to fetch reviews:", err))
      .finally(() => setIsLoading(false));
  }, [externalId]);

  // Ask once, when the form is first opened, whether photo upload is available.
  useEffect(() => {
    if (isWriting) arePhotoUploadsEnabled().then(setPhotosEnabled);
  }, [isWriting]);

  const clearPhotos = useCallback(() => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }, []);

  useEffect(() => () => clearPhotos(), [clearPhotos]);

  const handlePhotosPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError("");

    const room = MAX_REVIEW_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`You can add up to ${MAX_REVIEW_PHOTOS} photos.`);
      return;
    }

    const added: PendingPhoto[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const blob = await compressReviewPhoto(file);
        added.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, blob, previewUrl: URL.createObjectURL(blob) });
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : "We couldn't use that photo.");
      }
    }
    if (files.length > room) setPhotoError(`You can add up to ${MAX_REVIEW_PHOTOS} photos.`);
    if (added.length > 0) setPhotos((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = ""; // allow re-picking the same file
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
    setPhotoError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload photos first (only if the customer added any), then send the review.
      const pictureUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        setSubmitStatus(`Uploading photo ${i + 1} of ${photos.length}...`);
        pictureUrls.push(await uploadReviewPhoto(photos[i].blob));
      }

      setSubmitStatus("Submitting...");
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          id: externalId,
          reviewTitle: formData.title,
          reviewBody: formData.body,
          pictureUrls,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsWriting(false);
          setSubmitSuccess(false);
          setFormData({ name: "", email: "", rating: 5, title: "", body: "" });
          clearPhotos();
          setPhotoError("");
        }, 5000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to submit review: ${errorData.error || 'Please try again.'}`);
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error && err.message ? err.message : "An error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
      setSubmitStatus("");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFormData({ ...formData, rating: star })}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className="transition-colors hover:scale-110 cursor-pointer"
        >
          <Star
            size={24}
            fill={star <= rating ? "#B40417" : "transparent"}
            className={star <= rating ? "text-[#B40417]" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );

  // Lightbox: Esc closes, arrow keys move between a review's photos.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((l) => l && { ...l, index: (l.index + 1) % l.pictures.length });
      if (e.key === "ArrowLeft") setLightbox((l) => l && { ...l, index: (l.index - 1 + l.pictures.length) % l.pictures.length });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const visibleReviews = reviews.slice(0, visibleCount);
  const remaining = reviews.length - visibleReviews.length;

  return (
    <div className="w-full  py-4 border-t border-[#e5e5e5]/50 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl text-black flex flex-col justify-center items-center md:items-center  font-inter uppercase">
            Customer{" "}
            <span className="relative z-0 inline-block font-semibold italic px-1">
              <span className="absolute bottom-1 left-0 right-0 h-[38%] bg-[#F7E5B5] -z-10" />
              Reviews
            </span>
          </h2>
          <div className="flex items-center gap-3 mt-4">
            {totalReviews > 0 ? (
              <>
                <StarRating rating={averageRating} size={16} fillColor="#B40417" />
                <p className="text-sm font-inter text-gray-500 font-medium">
                  {averageRating.toFixed(1)} based on {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                </p>
              </>
            ) : (
              !isLoading && (
                <p className="text-sm font-inter text-gray-500 font-medium">No reviews yet</p>
              )
            )}
          </div>
        </div>
        <button
          onClick={() => setIsWriting(!isWriting)}
          className="bg-[#B40417] text-white px-6 py-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors"
        >
          {isWriting ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {isWriting && (
        <div className="bg-white p-6 md:p-8 font-inter border-2 border-[#e5e5e5] mb-12 shadow-sm max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
          {submitSuccess ? (
            <div className="text-center py-10 text-[#6c3518]">
              <h3 className="text-xl font-inter italic mb-2">Thank you!</h3>
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
                {renderStars(formData.rating)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border border-[#B30617] px-4 py-3 text-sm outline-none focus:border-[#B30617] transition-colors bg-[#B30617]/5"
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
                    className="border border-[#B30617] px-4 py-3 text-sm outline-none focus:border-[#B30617] transition-colors bg-[#B30617]/10"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
                  Review Title <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border border-[#B30617] px-4 py-3 text-sm outline-none focus:border-[#B30617] transition-colors bg-[#B30617]/10"
                  placeholder="Sum it up in a few words"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Review</label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="border border-[#B30617] px-4 py-3 text-sm outline-none focus:border-[#6c3518] transition-colors bg-[#B30617]/10 resize-none"
                  placeholder="Write your comments here..."
                />
              </div>

              {photosEnabled && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
                    Add Photos <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span>
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative w-20 h-20 border border-[#e5e5e5] bg-[#f5f1e6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.previewUrl} alt="Your photo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          aria-label="Remove photo"
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#B40417] transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {photos.length < MAX_REVIEW_PHOTOS && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 border border-dashed border-[#B30617] bg-[#B30617]/5 text-[#B30617] flex flex-col items-center justify-center gap-1 hover:bg-[#B30617]/10 transition-colors"
                      >
                        <ImagePlus size={20} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Add</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotosPicked(e.target.files)}
                  />
                  <p className="text-[11px] text-gray-400">Up to {MAX_REVIEW_PHOTOS} photos. Skip this if you'd rather not add any.</p>
                  {photoError && <p className="text-[12px] text-[#B30617]">{photoError}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#B40417] text-white px-6 py-4 text-[12px] font-semibold tracking-[0.15em] uppercase hover:bg-[#B30617]/75 transition-colors mt-2 disabled:opacity-50"
              >
                {isSubmitting ? submitStatus || "Submitting..." : "Submit Review"}
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
        <div className="text-center py-16 bg-[#e5e5e5]/20">
          <p className="text-gray-500 mb-4">Make the first move. Let us know how this product feels.</p>
          <button
            onClick={() => setIsWriting(true)}
            className="text-[#B30617] underline font-medium hover:text-black transition-colors"
          >
            Be the first to review
          </button>
        </div>
      ) : (
        <>
          {/* items-start: each card is exactly as tall as its own content. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {visibleReviews.map((review) => (
              <div key={review.id} className="bg-white p-6 border border-[#e5e5e5]/80 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start mb-1">
                  <StarRating rating={review.rating} size={16} fillColor="#B40417" />
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-semibold text-[15px] text-[#2a2a2a] leading-tight flex flex-col">
                    {review.title}
                  </h4>
                )}
                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {review.body}
                </p>

                {review.pictures && review.pictures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.pictures.map((picture, index) => (
                      <button
                        key={picture.full}
                        type="button"
                        onClick={() => setLightbox({ pictures: review.pictures!, index })}
                        aria-label="View photo"
                        className="w-16 h-16 border border-[#e5e5e5] overflow-hidden bg-[#f5f1e6] hover:opacity-90 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={picture.thumb} alt="Customer photo" loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 font-medium border-t border-[#e5e5e5]/50 pt-3 mt-1">
                  <span className="text-[#6c3518] font-semibold">{review.reviewer.name}</span>
                </div>
              </div>
            ))}
          </div>

          {remaining > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
                className="border border-[#B40417] text-[#B40417] px-8 py-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[#B40417] hover:text-white transition-colors"
              >
                Show more reviews ({remaining} more)
              </button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[2000] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Review photo"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={22} />
          </button>

          {lightbox.pictures.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.pictures.length) % lightbox.pictures.length }); }}
                aria-label="Previous photo"
                className="absolute left-3 md:left-6 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.pictures.length }); }}
                aria-label="Next photo"
                className="absolute right-3 md:right-6 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.pictures[lightbox.index].full}
            alt="Customer photo"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
