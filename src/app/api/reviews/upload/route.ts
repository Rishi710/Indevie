import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * Temporary public home for a photo a customer attaches to a review.
 *
 * Judge.me's API takes photos as image URLs, not file uploads, so the photo has
 * to live at a public address for Judge.me to fetch. Uploads happen only when
 * the customer submits the review, and the browser has already shrunk the image
 * (about 1600px, a few hundred KB).
 *
 * Needs a Vercel Blob store connected to the project (it provides
 * BLOB_READ_WRITE_TOKEN). Without one, this reports "disabled" and the review
 * form simply doesn't show the photo option.
 */

const MAX_BYTES = 1.5 * 1024 * 1024; // browser-compressed photos are well under this
const MAX_UPLOADS_PER_WINDOW = 12;
const WINDOW_MS = 10 * 60 * 1000;

// Best-effort abuse limit (per server instance). Keeps casual spam from filling storage.
const recentUploads = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentUploads.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_UPLOADS_PER_WINDOW) {
    recentUploads.set(ip, hits);
    return true;
  }
  hits.push(now);
  recentUploads.set(ip, hits);
  return false;
}

/** Identify the real image type from the file's first bytes, ignoring the name the client claims. */
function detectImageType(bytes: Uint8Array): { ext: string; mime: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // WEBP
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

/** Lets the review form know whether to offer the photo option. */
export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Photo upload is not available right now." }, { status: 503 });
  }

  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many uploads. Please try again in a few minutes." }, { status: 429 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No photo received." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "That photo is too large. Please choose a smaller one." }, { status: 413 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) {
      return NextResponse.json({ error: "Please upload a JPG, PNG or WebP photo." }, { status: 415 });
    }

    const blob = await put(`review-photos/photo.${type.ext}`, bytes as unknown as Blob, {
      access: "public",
      contentType: type.mime,
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("[Review photo upload] failed:", error);
    return NextResponse.json({ error: "Could not upload the photo. Please try again." }, { status: 500 });
  }
}
