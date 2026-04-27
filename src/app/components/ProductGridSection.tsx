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
    <section className="py-8 md:py-4 lg:py-4 px-0 md:px-10 lg:px-10 bg-[#f5f1e6] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16 gap-5">
           <h2 className="text-4xl md:text-5xl text-red-800 ">
          <span className="font-semibold italic">
            Channel your Inner Devi 
           </span> 
        </h2>
           <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#6c3518]">
            with Indevie</span> 
        </div>
        {/* <h2 className="text-4xl text-[#2a2a2a] mb-8 lg:mb-10 font-poppins text-center italic px-4">Channel you Inner <span className="text-[#7a4d34] font-semibold"><br/>Devi with Indevie </span></h2> */}
        
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
