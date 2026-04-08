import { fetchProduct, fetchRecommendedProducts } from "@/lib/shopify";
import { notFound } from "next/navigation";
import ProductPageClient from "@/app/products/[handle]/ProductPageClient";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> | { handle: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const product = await fetchProduct(resolvedParams.handle);

  if (!product) {
    return notFound();
  }

  const relatedProducts = await fetchRecommendedProducts(product.id);

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
