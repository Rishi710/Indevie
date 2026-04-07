import { fetchProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

export default async function ProductGridSection() {
  const products = await fetchProducts(4);

  if (!products || products.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 bg-white">
        <h2 className="text-2xl mb-8">Latest Products</h2>
        <p className="text-gray-500">No products found in Shopify store.</p>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-24 px-4 md:px-10 lg:px-16 bg-[#f5f1e6]">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl text-[#2a2a2a] mb-8 font-medium flex w-full justify-center text-center">Our Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-1">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
