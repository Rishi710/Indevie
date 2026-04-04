import { fetchBlogWithArticles } from "@/lib/shopify";
import BlogsCarouselClient from "./BlogsCarouselClient";

export default async function BlogsCarousel() {
  const { items: articles } = await fetchBlogWithArticles();

  if (!articles || articles.length === 0) {
    return null;
  }

  // Show recent 6 articles in the carousel
  const recentArticles = articles.slice(0, 6);

  return <BlogsCarouselClient articles={recentArticles} />;
}
