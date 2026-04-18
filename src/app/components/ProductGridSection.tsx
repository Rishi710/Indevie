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
    <section className="py-10 md:py-20 px-0 md:px-10 lg:px-16 bg-[#f5f1e6] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-5xl text-[#2a2a2a] mb-8 lg:mb-12 font-poppins text-center px-4">The <span className="text-[#7a4d34]">Pure Skin</span> Rituals</h2>
        
        <div className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none gap-4 lg:gap-1 px-4 md:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map((product) => (
            <div key={product.id} className="min-w-[85vw] sm:min-w-[45vw] lg:min-w-0 snap-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
