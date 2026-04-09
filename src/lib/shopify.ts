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
  descriptionHtml?: string;
  description?: string;
  options?: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants: {
    nodes: {
      id: string;
      title?: string;
      availableForSale?: boolean;
      price: {
        amount: string;
        currencyCode: string;
      };
      selectedOptions?: {
        name: string;
        value: string;
      }[];
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

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      description
      options {
        id
        name
        values
      }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
      images(first: 20) {
        nodes {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export async function fetchProduct(handle: string): Promise<ShopifyProduct | null> {
  try {
    const data: any = await storefrontClient.request(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
    return data.product || null;
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return null;
  }
}

export const GET_RECOMMENDED_PRODUCTS_QUERY = `
  query productRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
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
`;

export async function fetchRecommendedProducts(productId: string): Promise<ShopifyProduct[]> {
  try {
    const data: any = await storefrontClient.request(GET_RECOMMENDED_PRODUCTS_QUERY, { productId });
    return data.productRecommendations || [];
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}


export const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const GET_CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          totalPriceV2 {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              title
              quantity
              variant {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function loginCustomer(email: string, password: string) {
  try {
    const data: any = await storefrontClient.request(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
      input: { email, password },
    });
    return data.customerAccessTokenCreate;
  } catch (error) {
    console.error("Login Error:", error);
    return null;
  }
}

export async function registerCustomer(input: any) {
  try {
    const data: any = await storefrontClient.request(CUSTOMER_CREATE_MUTATION, {
      input,
    });
    return data.customerCreate;
  } catch (error) {
    console.error("Registration Error:", error);
    return null;
  }
}

export async function fetchCustomer(accessToken: string) {
  try {
    const data: any = await storefrontClient.request(GET_CUSTOMER_QUERY, {
      customerAccessToken: accessToken,
    });
    return data.customer;
  } catch (error) {
    console.error("Fetch Customer Error:", error);
    return null;
  }
}

export const CUSTOMER_RECOVER_MUTATION = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function recoverCustomer(email: string) {
  try {
    const data: any = await storefrontClient.request(CUSTOMER_RECOVER_MUTATION, {
      email,
    });
    return data.customerRecover;
  } catch (error) {
    console.error("Recovery Error:", error);
    return null;
  }
}
