import { fetchProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

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
    <section className="py-8 md:py-4 lg:py-4 px-0 md:px-10 lg:px-10 bg-[#f5f1e6] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16 gap-5">
          <h2 className="text-3xl md:text-4xl text-red-800 ">
            <span className="font-semibold italic">
              Channel your Inner Devi
            </span>
          </h2>
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#6c3518]">
            with Indevie</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 px-4 md:px-0">
          {products.slice(0, 5).map((product, idx) => (
            <div key={product.id} className={idx >= 4 ? "hidden lg:block" : ""}>
              <ProductCard product={product} priority={idx === 0} />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="/shop"
            className="inline-block text-[11px] font-bold tracking-[0.3em] uppercase text-[#6c3518] border border-[#6c3518]/30 px-8 py-3 rounded-full hover:bg-[#6c3518] hover:text-white transition-all duration-300"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
}
