import { fetchArticle, fetchBlogWithArticles } from "@/lib/shopify";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const { blogHandle } = await fetchBlogWithArticles();
  const post = await fetchArticle(blogHandle, handle);

  if (!post) return { title: "Article Not Found" };

  return {
    title: `${post.title} | Indevie Journal`,
    description: post.excerpt || `Read ${post.title} on Indevie Journal.`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image.url }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { handle } = await params;
  const { blogHandle } = await fetchBlogWithArticles();
  const post = await fetchArticle(blogHandle, handle);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen pt-32 pb-24 bg-white">
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <div className="mb-12">
          <Link 
            href="/blogs" 
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-red-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Journal
          </Link>
        </div>

        {/* Header Section */}
        <div className="space-y-8 mb-16 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-red-800">Journal</span>
            <span className="w-6 h-[1px] bg-red-800/20"></span>
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-gray-400">{formattedDate}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-gray-900 leading-[1.1] italic">
            {post.title}
          </h1>
          
          {post.authorV2 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[10px] font-bold text-red-800 uppercase">
                {post.authorV2.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-600">Written by {post.authorV2.name}</span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="relative aspect-[16/9] mb-16 overflow-hidden rounded-sm bg-gray-100 shadow-2xl shadow-gray-200/50">
            <Image
              src={post.image.url}
              alt={post.image.altText || post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Content Section */}
        <div 
          className="prose prose-lg prose-gray max-w-none 
            prose-headings:font-serif prose-headings:italic prose-headings:font-normal
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:font-light
            prose-strong:font-semibold prose-strong:text-gray-900
            prose-img:rounded-sm prose-img:shadow-lg
            prose-a:text-red-800 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-red-800 prose-blockquote:bg-red-50/30 prose-blockquote:px-8 prose-blockquote:py-2 prose-blockquote:rounded-r-sm prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Footer / Share Section */}
        <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-4">
             <button className="text-[10px] uppercase tracking-widest font-bold px-6 py-3 border border-gray-200 hover:bg-gray-50 transition-colors">
               Share Article
             </button>
          </div>
          <Link href="/blogs" className="text-sm font-serif italic text-gray-600 hover:text-red-900 transition-colors">
            Continue Reading →
          </Link>
        </div>

      </article>

      {/* Suggested Articles Section could go here */}
    </main>
  );
}
