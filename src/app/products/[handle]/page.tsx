import { fetchProduct, fetchRecommendedProducts } from "@/lib/shopify";
import { notFound } from "next/navigation";
import ProductPageClient from "@/app/products/[handle]/ProductPageClient";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await fetchProduct(handle);

  if (!product) {
    return notFound();
  }

  const relatedProducts = await fetchRecommendedProducts(product.id);

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
