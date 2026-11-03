// Browser-side helpers for the optional photos on a review.

export const MAX_REVIEW_PHOTOS = 3;

const MAX_DIMENSION = 1600; // px, longest side
const JPEG_QUALITY = 0.82;
const MAX_PICKED_BYTES = 20 * 1024 * 1024; // refuse absurdly large originals before decoding

/**
 * Shrinks a customer's photo (often 3-10 MB straight from a phone camera) to a
 * ~1600px JPEG of a few hundred KB, so uploads are fast and storage stays tiny.
 * Honors the photo's rotation. Throws a customer-readable Error on failure.
 */
export async function compressReviewPhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_PICKED_BYTES) {
    throw new Error("That photo is too large. Please choose one under 20 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("We couldn't read that photo. Please try a JPG or PNG.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process that photo.");

  ctx.fillStyle = "#ffffff"; // flatten transparent PNGs onto white, since JPEG has no transparency
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) throw new Error("Your browser couldn't process that photo.");
  return blob;
}

/** Uploads one compressed photo and returns its public URL. */
export async function uploadReviewPhoto(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "photo.jpg");

  const res = await fetch("/api/reviews/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Could not upload the photo. Please try again.");
  }
  return data.url as string;
}

/** Whether the store can accept photo uploads (a storage bucket is connected). */
export async function arePhotoUploadsEnabled(): Promise<boolean> {
  try {
    const res = await fetch("/api/reviews/upload");
    if (!res.ok) return false;
    return Boolean((await res.json()).enabled);
  } catch {
    return false;
  }
}
