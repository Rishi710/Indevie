import { fetchProduct, fetchRecommendedProducts, fetchProducts } from "@/lib/shopify";
import { notFound } from "next/navigation";
import ProductPageClient from "@/app/products/[handle]/ProductPageClient";
import ProductGridSection from "@/app/components/ProductGridSection";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [product, products] = await Promise.all([
    fetchProduct(handle),
    fetchProducts(50),
  ]);

  if (!product) {
    return notFound();
  }

  const relatedProducts = await fetchRecommendedProducts(product.id);

  return (
    <ProductPageClient
      product={product}
      relatedProducts={relatedProducts}
      productGridSection={<ProductGridSection initialProducts={products} />}
    />
  );
}
