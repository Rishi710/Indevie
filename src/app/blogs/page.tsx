import { fetchBlogWithArticles } from "@/lib/shopify";
import BlogHero from "../components/BlogHero";
import HomeBlogCard from "../components/HomeBlogCard";
import ShaderBackground from "../components/ShaderBackground";

export const revalidate = 3600; // Recache every hour

export default async function BlogsPage() {
  const { items: articles } = await fetchBlogWithArticles();

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-serif text-gray-900">No Stories Found</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            We haven't shared any journals yet. Please check back later for more updates.
          </p>
        </div>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <main className="relative min-h-screen bg-[#f5f1e6] overflow-x-hidden">
      {/* Hero Section for Blogs */}
      <section className="relative h-[95vh] md:h-[95vh] w-full overflow-hidden flex flex-col items-center justify-center text-center px-6">
        <div className="fixed inset-0 w-full h-[100vh] md:h-[100vh] z-0">
          <ShaderBackground />
        </div>
        
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-7xl font-poppins text-white mb-4 drop-shadow-md">
            Our Blogs
          </h1>
          <p className="text-white/90 text-[20px] md:text-xs uppercase tracking-[0.5em] font-light max-w-lg mx-auto leading-loose">
            Discover our latest rituals and stories.
          </p>
        </div>
      </section>

      {/* Content Container */}
      <div className="relative z-20 bg-white pt-8 pb-24">
        <BlogHero post={featuredArticle} />

      {/* Grid for Remaining Posts */}
      {remainingArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16 space-y-4 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-poppins text-gray-900">Latest Journals</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Explore our collection of stories, rituals, and mindful insights.
            </p>
            <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 pt-4">
              {remainingArticles.length} ARTICLES
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {remainingArticles.map((post, index) => (
              <HomeBlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter / CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="bg-red-50 py-20 px-8 space-y-8 rounded-sm">
           <span className="text-xs uppercase tracking-[0.4em] font-bold text-red-800">The Ritual</span>
           <h3 className="text-3xl md:text-4xl font-serif text-gray-900 italic">Join our journal list</h3>
           <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
             Get the latest skincare rituals and sustainable insights delivered straight to your inbox.
           </p>
           <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 pt-4">
             <input 
               type="email" 
               placeholder="Your Email" 
               className="flex-1 px-6 py-4 border border-gray-200 focus:outline-none focus:border-red-800 text-sm rounded-none"
             />
             <button className="px-10 py-4 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-900 transition-colors">
               Subscribe
             </button>
           </form>
        </div>
      </section>
      </div>
    </main>
  );
}
