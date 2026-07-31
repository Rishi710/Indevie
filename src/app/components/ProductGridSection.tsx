import { fetchProducts } from "@/lib/shopify";
import ProductSlider from "./ProductSlider";

function getCategoryRank(title: string, handle: string): number {
  const t = title.toLowerCase();
  const h = handle.toLowerCase();
  if (t.includes("gift") || h.includes("gift")) return 2;
  if (t.includes("mini") || h.includes("mini")) return 3;
  // Single = anything that is not a gift box or mini
  return 1;
}

interface ProductGridSectionProps {
  initialProducts?: any[];
}

export default async function ProductGridSection({ initialProducts }: ProductGridSectionProps) {
  const rawProducts = initialProducts || await fetchProducts(50);

  const preferredHandles = [
    "geeli-mitti-face-mist",
    "gulkand-face-mist",
    "gulaab-tez-dhoop-sunshield-ayurvedic-spf-50-pa-sunscreen",
    "indevie-calm-balm"
  ];

  const sortedRaw = [...rawProducts].sort(
    (a, b) => getCategoryRank(a.title, a.handle) - getCategoryRank(b.title, b.handle)
  );

  const preferred: typeof sortedRaw = [];
  const others: typeof sortedRaw = [];

  preferredHandles.forEach(handle => {
    const found = sortedRaw.find(p => p.handle === handle);
    if (found) {
      preferred.push(found);
    }
  });

  sortedRaw.forEach(p => {
    if (!preferredHandles.includes(p.handle)) {
      others.push(p);
    }
  });

  const products = [...preferred, ...others];

  if (!products || products.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 bg-white">
        <h2 className="text-2xl mb-8">Latest Products</h2>
        <p className="text-gray-500">No products found in Shopify store.</p>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-10 px-4 sm:px-10 md:px-20 lg:px-20 bg-[#f5f1e6] overflow-hidden">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col items-center text-center mb-8 md:mb-16 gap-3 md:gap-5 mt-4 md:mt-12">
          {/* <h2 className="text-3xl md:text-4xl text-red-800 pt-14 font-inter">
            <span className="font-semibold italic">
              Channel your Inner Devi
            </span>
          </h2> */}
          <h2 className="text-4xl md:text-5xl text-black font-inter uppercase">
            The <span className="font-semibold italic">
              Crowd Favourites</span>
          </h2>
          {/* <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#6c3518]">
            You can&apos;t get enough of</span> */}
        </div>

        <ProductSlider products={products.slice(0, 5)} />

        <div className="flex justify-center font-inter mt-10">
          <a
            href="/shop"
            className="inline-block text-[14px] font-bold tracking-[0.1em] uppercase text-[#6c3518] border border-[#6c3518]/30 px-8 py-3 hover:bg-[#6c3518] hover:text-white transition-all duration-300"
          >
            Explore All
          </a>
        </div>
      </div>
    </section>
  );
}
