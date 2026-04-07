import { GraphQLClient } from "graphql-request";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !storefrontAccessToken) {
  throw new Error("Missing Shopify environment variables");
}

const endpoint = `https://${domain}/api/2024-01/graphql.json`;

export const storefrontClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
  },
});

export interface ShopifyImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  handle: string;
  excerpt?: string;
  contentHtml: string;
  publishedAt: string;
  image?: ShopifyImage;
  authorV2?: {
    name: string;
  };
}

export interface Blog {
  id: string;
  title: string;
  handle: string;
  articles: {
    nodes: BlogPost[];
  };
}

export const GET_BLOGS_QUERY = `
  query getBlogs {
    blogs(first: 1) {
      nodes {
        id
        title
        handle
        articles(first: 50, sortKey: PUBLISHED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            excerpt
            publishedAt
            image {
              url
              altText
              width
              height
            }
            authorV2 {
              name
            }
          }
        }
      }
    }
  }
`;

export const GET_ARTICLE_BY_HANDLE_QUERY = `
  query getArticleByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        title
        handle
        contentHtml
        publishedAt
        image {
          url
          altText
          width
          height
        }
        authorV2 {
          name
        }
      }
    }
  }
`;

export async function fetchBlogWithArticles(): Promise<{ items: BlogPost[]; blogHandle: string }> {
  try {
    const data: any = await storefrontClient.request(GET_BLOGS_QUERY);
    const blog = data.blogs.nodes[0];
    return {
      items: blog?.articles.nodes || [],
      blogHandle: blog?.handle || "journal",
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { items: [], blogHandle: "journal" };
  }
}

export async function fetchArticle(blogHandle: string, articleHandle: string): Promise<BlogPost | null> {
  try {
    const data: any = await storefrontClient.request(GET_ARTICLE_BY_HANDLE_QUERY, {
      blogHandle,
      articleHandle,
    });
    return data.blog?.articleByHandle || null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  variants: {
    nodes: {
      id: string;
      price: {
        amount: string;
        currencyCode: string;
      };
    }[];
  };
  images: {
    nodes: ShopifyImage[];
  };
}

export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        variants(first: 1) {
          nodes {
            id
            price {
              amount
              currencyCode
            }
          }
        }
        images(first: 5) {
          nodes {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export async function fetchProducts(limit = 10): Promise<ShopifyProduct[]> {
  try {
    const data: any = await storefrontClient.request(GET_PRODUCTS_QUERY, { first: limit });
    return data.products?.nodes || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
