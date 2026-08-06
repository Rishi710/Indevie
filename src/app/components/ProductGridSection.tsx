import { fetchCollectionProducts } from "@/lib/shopify";
import ProductSlider from "./ProductSlider";

// The real "Best Sellers" collection in Shopify Admin -- its handle is
// "single" (named after the single-item product type, not a slug for
// "Best Sellers" itself). This section shows exactly what's in that
// collection, in the order Shopify Admin has it, no client-side reordering.
const BEST_SELLERS_COLLECTION_HANDLE = "single";

export default async function ProductGridSection() {
  const collection = await fetchCollectionProducts(BEST_SELLERS_COLLECTION_HANDLE, 20);
  const products = collection?.products || [];

  if (products.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 bg-white">
        <h2 className="text-2xl mb-8">Best Sellers</h2>
        <p className="text-gray-500">No products found in the Best Sellers collection.</p>
      </section>
    );
  }

  return (
    <section className="py-5 md:py-5 px-4 sm:px-10 md:px-20 lg:px-20 bg-white overflow-hidden">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col items-center text-center mb-8 md:mb-16 gap-3 md:gap-5 mt-4 md:mt-12">
          <h2 className="text-4xl md:text-5xl text-black font-inter uppercase">
            The <span className="font-semibold italic">Crowd</span>{" "}
            <span className="relative z-0 inline-block font-semibold italic px-1">
              <span className="absolute bottom-1 left-0 right-0 h-[38%] bg-[#F7E5B5] -z-10" />
              Favourites
            </span>
          </h2>
        </div>

        <ProductSlider products={products} />

        <div className="flex justify-center font-inter mt-10 mb-10">
          <a
            href="/shop"
            className="inline-block text-[14px] hover:text-[#6c3518] bg-[#B40417] font-semibold tracking-[0.1em] uppercase text-[#ffffff] border border-[#6c3518]/30 px-8 py-3 hover:bg-[#ffffff] hover:text-[#B40417] transition-all duration-300"
          >
            Explore All
          </a>
        </div>
      </div>
    </section>
  );
}
