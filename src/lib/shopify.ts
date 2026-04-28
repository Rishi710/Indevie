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
      compareAtPrice?: {
        amount: string;
        currencyCode: string;
      } | null;
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
            compareAtPrice {
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

export const GET_COLLECTIONS_QUERY = `
  query getCollections {
    collections(first: 20) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

export async function fetchCollections(): Promise<{ id: string; title: string; handle: string }[]> {
  try {
    const data: any = await storefrontClient.request(GET_COLLECTIONS_QUERY);
    return data.collections?.nodes || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export const GET_COLLECTION_PRODUCTS_QUERY = `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
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
              compareAtPrice {
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
  }
`;

export async function fetchCollectionProducts(handle: string, limit = 20): Promise<{ collectionTitle: string, products: ShopifyProduct[] } | null> {
  try {
    const data: any = await storefrontClient.request(GET_COLLECTION_PRODUCTS_QUERY, { handle, first: limit });
    if (!data.collection) return null;
    return {
      collectionTitle: data.collection.title,
      products: data.collection.products?.nodes || []
    };
  } catch (error) {
    console.error(`Error fetching collection ${handle}:`, error);
    return null;
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
          compareAtPrice {
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
          compareAtPrice {
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
      defaultAddress {
        address1
        address2
        city
        province
        country
        zip
      }
      addresses(first: 10) {
        nodes {
          id
          address1
          address2
          city
          province
          country
          zip
          phone
          firstName
          lastName
        }
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPriceV2 {
            amount
            currencyCode
          }
          subtotalPriceV2 {
            amount
            currencyCode
          }
          totalTaxV2 {
            amount
            currencyCode
          }
          totalShippingPriceV2 {
            amount
            currencyCode
          }
          shippingAddress {
            address1
            address2
            city
            province
            zip
            country
          }
          lineItems(first: 50) {
            nodes {
              title
              quantity
              variant {
                title
                price {
                  amount
                  currencyCode
                }
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

export const CUSTOMER_UPDATE_MUTATION = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
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

export async function updateCustomer(accessToken: string, customerInput: any) {
  try {
    const data: any = await storefrontClient.request(CUSTOMER_UPDATE_MUTATION, {
      customerAccessToken: accessToken,
      customer: customerInput,
    });
    return data.customerUpdate;
  } catch (error) {
    console.error("Update Customer Error:", error);
    return null;
  }
}

// --- Cart Mutations & Queries ---

export const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 100) {
    nodes {
      id
      quantity
      estimatedCost {
        totalAmount {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          product {
            id
            title
            handle
          }
          image {
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
`;

export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ${CART_FRAGMENT}
      }
    }
  }
`;

export const ADD_CART_LINES_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FRAGMENT}
      }
    }
  }
`;

export const UPDATE_CART_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FRAGMENT}
      }
    }
  }
`;

export const REMOVE_CART_LINES_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FRAGMENT}
      }
    }
  }
`;

export const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FRAGMENT}
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// --- Cart Helper Functions ---

export async function createCart(variantId?: string, quantity = 1): Promise<any> {
  const input = variantId ? { lines: [{ merchandiseId: variantId, quantity }] } : {};
  try {
    const data: any = await storefrontClient.request(CREATE_CART_MUTATION, { input });
    return data.cartCreate.cart;
  } catch (error) {
    console.error("Create Cart Error:", error);
    return null;
  }
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<any> {
  try {
    const data: any = await storefrontClient.request(ADD_CART_LINES_MUTATION, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });
    return data.cartLinesAdd.cart;
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return null;
  }
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<any> {
  try {
    const data: any = await storefrontClient.request(UPDATE_CART_LINES_MUTATION, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });
    return data.cartLinesUpdate.cart;
  } catch (error) {
    console.error("Update Cart Line Error:", error);
    return null;
  }
}

export async function removeFromCart(cartId: string, lineId: string): Promise<any> {
  try {
    const data: any = await storefrontClient.request(REMOVE_CART_LINES_MUTATION, {
      cartId,
      lineIds: [lineId],
    });
    return data.cartLinesRemove.cart;
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    return null;
  }
}

export async function fetchCart(cartId: string): Promise<any> {
  try {
    const data: any = await storefrontClient.request(GET_CART_QUERY, { cartId });
    return data.cart;
  } catch (error) {
    console.error("Fetch Cart Error:", error);
    return null;
  }
}

export async function updateCartBuyerIdentity(cartId: string, customerAccessToken: string): Promise<any> {
  try {
    const data: any = await storefrontClient.request(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
      cartId,
      buyerIdentity: { customerAccessToken },
    });
    return data.cartBuyerIdentityUpdate.cart;
  } catch (error) {
    console.error("Update Cart Buyer Identity Error:", error);
    return null;
  }
}

