import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/shopify";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProducts(query, 8);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ products: [], error: "Search failed" }, { status: 500 });
  }
}
