import { GraphQLClient } from "graphql-request";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !storefrontAccessToken) {
  throw new Error("Missing Shopify environment variables");
}

const isBrowser = typeof window !== "undefined";
const endpoint = isBrowser 
  ? `${window.location.origin}/api/shopify` 
  : `https://${domain}/api/2024-01/graphql.json`;

export const storefrontClient = new GraphQLClient(endpoint, {
  headers: isBrowser ? {} : {
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
  productType?: string;
  vendor?: string;
  tags?: string[];
  /** custom.concern metafield — a list.single_line_text_field, so `value` is a JSON-stringified string array (or null if unset). */
  concernMetafield?: { value: string } | null;
  /** custom.size metafield — a single_line_text_field, so `value` is a plain string (or null if unset). */
  sizeMetafield?: { value: string } | null;
  /** custom.info metafield — a single_line_text_field, so `value` is a plain string (or null if unset). Powers the product card's black banner label. */
  infoMetafield?: { value: string } | null;
  /** custom.benefits metafield — a rich_text_field, so `value` is a JSON-stringified rich text AST (or null if unset). */
  benefitsMetafield?: { value: string } | null;
  /** custom.ingredients metafield — a rich_text_field, so `value` is a JSON-stringified rich text AST (or null if unset). */
  ingredientsMetafield?: { value: string } | null;
  /** custom.how_to_use metafield — a rich_text_field, so `value` is a JSON-stringified rich text AST (or null if unset). */
  howToUseMetafield?: { value: string } | null;
  /** custom.inside_the_box metafield — a rich_text_field, so `value` is a JSON-stringified rich text AST (or null if unset). */
  insideTheBoxMetafield?: { value: string } | null;
  /** custom.additional_information metafield — a rich_text_field, so `value` is a JSON-stringified rich text AST (or null if unset). */
  additionalInfoMetafield?: { value: string } | null;
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
      /**
       * Raw tracked inventory count. Can be zero or negative even when
       * availableForSale is true if the merchant allows overselling/backorder
       * for this variant — only treat it as a hard cap when it's a positive
       * number; availableForSale is the authoritative purchasability signal.
       */
      quantityAvailable?: number | null;
      price: {
        amount: string;
        currencyCode: string;
      };
      compareAtPrice?: {
        amount: string;
        currencyCode: string;
      } | null;
      image?: ShopifyImage | null;
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

/**
 * Reads the real "Shop by Concern" values from the custom.concern Shopify
 * metafield (a list.single_line_text_field), which the Storefront API returns
 * as a JSON-stringified array. No tag or title-keyword fallback — a product
 * simply has no concerns to filter by until it's tagged in Shopify Admin.
 *
 * Strips zero-width/invisible Unicode characters (e.g. U+2060 WORD JOINER)
 * that sneak in from copy-pasting text into Shopify Admin — otherwise
 * "Sleep Inducing" and "⁠Sleep Inducing" render as two separate filter
 * options that look identical to a shopper.
 */
function normalizeMetafieldText(value: string): string {
  // Strips zero-width/invisible Unicode code points (U+200B-200D, U+2060, U+FEFF)
  return value.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").trim();
}

// Shared parser for every list.single_line_text_field metafield (concern,
// benefits, ingredient, how_to_use, additional_information all use this shape).
function getMetafieldStringList(metafield?: { value: string } | null): string[] {
  const raw = metafield?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .map(normalizeMetafieldText)
      .filter((v) => v.length > 0);
  } catch {
    return [];
  }
}

export function getProductConcerns(product: Pick<ShopifyProduct, "concernMetafield">): string[] {
  return getMetafieldStringList(product.concernMetafield);
}

interface RichTextNode {
  type: string;
  value?: string;
  level?: number;
  listType?: string;
  bold?: boolean;
  italic?: boolean;
  children?: RichTextNode[];
}

// Font size per heading level -- embedded directly as Tailwind classes rather
// than relying on the @tailwindcss/typography "prose" plugin to cascade its
// own h1-h6 sizing, which wasn't reliably taking effect in this app.
const RICH_TEXT_HEADING_CLASSES: Record<number, string> = {
  1: "text-2xl font-bold text-[#6c3518] mt-5 mb-2",
  2: "text-xl font-bold text-[#6c3518] mt-5 mb-2",
  3: "text-lg font-bold text-[#6c3518] mt-4 mb-2",
  4: "text-base font-bold text-[#6c3518] mt-4 mb-1.5",
  5: "text-sm font-bold text-[#6c3518] mt-3 mb-1",
  6: "text-sm font-bold text-[#6c3518] mt-3 mb-1",
};

// Converts one node of Shopify's rich_text_field JSON tree into an HTML
// string. Spacing/sizing classes are embedded directly on each element so
// blank spacer paragraphs and heading levels the merchant picks in Shopify
// Admin actually show up distinctly, rather than depending on typography
// plugin defaults to cascade correctly. The caller is responsible for
// sanitizing the result (DOMPurify) before rendering.
function richTextNodeToHtml(node: RichTextNode): string {
  const inner = (node.children || []).map(richTextNodeToHtml).join("");

  switch (node.type) {
    case "root":
      return inner;
    case "heading": {
      const level = Math.min(Math.max(node.level || 4, 1), 6);
      const classes = RICH_TEXT_HEADING_CLASSES[level];
      return `<h${level} class="${classes}">${inner}</h${level}>`;
    }
    case "paragraph":
      // A paragraph with no real content is a merchant-added blank line for
      // spacing -- give it a min-height so that intent still shows up
      // instead of collapsing to nothing.
      return inner.trim().length > 0
        ? `<p class="mb-3 leading-relaxed">${inner}</p>`
        : `<p class="mb-3 min-h-[1em]"></p>`;
    case "list":
      return node.listType === "ordered"
        ? `<ol class="list-decimal pl-5 mb-3 space-y-1.5">${inner}</ol>`
        : `<ul class="list-disc pl-5 mb-3 space-y-1.5">${inner}</ul>`;
    case "list-item":
      return `<li class="leading-relaxed">${inner}</li>`;
    case "text": {
      let text = (node.value || "").replace(/\n/g, "<br/>");
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      return text;
    }
    default:
      return inner;
  }
}

/**
 * Reads the real custom.ingredients metafield (a rich_text_field) and
 * converts Shopify's rich text tree into HTML for the caller to sanitize
 * and render. No dummy fallback -- returns null when unset so the section
 * can hide itself entirely.
 */
export function getProductIngredientsHtml(product: Pick<ShopifyProduct, "ingredientsMetafield">): string | null {
  const raw = product.ingredientsMetafield?.value;
  if (!raw) return null;
  try {
    const html = richTextNodeToHtml(JSON.parse(raw));
    return html.trim().length > 0 ? html : null;
  } catch {
    return null;
  }
}

/**
 * Reads the real custom.benefits metafield (a rich_text_field) and converts
 * Shopify's rich text tree into HTML for the caller to sanitize and render.
 * No dummy fallback -- returns null when unset so the section can hide itself.
 */
export function getProductBenefitsHtml(product: Pick<ShopifyProduct, "benefitsMetafield">): string | null {
  const raw = product.benefitsMetafield?.value;
  if (!raw) return null;
  try {
    const html = richTextNodeToHtml(JSON.parse(raw));
    return html.trim().length > 0 ? html : null;
  } catch {
    return null;
  }
}

/**
 * Reads the real custom.how_to_use metafield (a rich_text_field) and converts
 * Shopify's rich text tree into HTML for the caller to sanitize and render.
 * No dummy fallback -- returns null when unset so the section can hide itself.
 */
export function getProductHowToUseHtml(product: Pick<ShopifyProduct, "howToUseMetafield">): string | null {
  const raw = product.howToUseMetafield?.value;
  if (!raw) return null;
  try {
    const html = richTextNodeToHtml(JSON.parse(raw));
    return html.trim().length > 0 ? html : null;
  } catch {
    return null;
  }
}

/**
 * Reads the real custom.inside_the_box metafield (a rich_text_field) and
 * converts Shopify's rich text tree into HTML for the caller to sanitize and
 * render. No dummy fallback -- returns null when unset so the section can
 * hide itself entirely.
 */
export function getProductInsideTheBoxHtml(product: Pick<ShopifyProduct, "insideTheBoxMetafield">): string | null {
  const raw = product.insideTheBoxMetafield?.value;
  if (!raw) return null;
  try {
    const html = richTextNodeToHtml(JSON.parse(raw));
    return html.trim().length > 0 ? html : null;
  } catch {
    return null;
  }
}

/**
 * Reads the real custom.additional_information metafield (a rich_text_field)
 * and converts Shopify's rich text tree into HTML for the caller to sanitize
 * and render. No dummy fallback -- returns null when unset so the section
 * can hide itself entirely.
 */
export function getProductAdditionalInfoHtml(product: Pick<ShopifyProduct, "additionalInfoMetafield">): string | null {
  const raw = product.additionalInfoMetafield?.value;
  if (!raw) return null;
  try {
    const html = richTextNodeToHtml(JSON.parse(raw));
    return html.trim().length > 0 ? html : null;
  } catch {
    return null;
  }
}

/**
 * Reads the real product size from the custom.size Shopify metafield (a
 * single_line_text_field, one value per product). No tag or title-keyword
 * fallback -- a product simply has no size to filter by until it's set in
 * Shopify Admin.
 */
export function getProductSize(product: Pick<ShopifyProduct, "sizeMetafield">): string | null {
  const raw = product.sizeMetafield?.value;
  if (!raw) return null;
  const normalized = normalizeMetafieldText(raw);
  return normalized.length > 0 ? normalized : null;
}

/**
 * Reads the real product card banner label from the custom.info Shopify
 * metafield (a single_line_text_field). No tag or title-keyword fallback --
 * a product simply shows no banner until it's set in Shopify Admin.
 */
export function getProductInfo(product: Pick<ShopifyProduct, "infoMetafield">): string | null {
  const raw = product.infoMetafield?.value;
  if (!raw) return null;
  const normalized = normalizeMetafieldText(raw);
  return normalized.length > 0 ? normalized : null;
}

export interface StockInfo {
  isOutOfStock: boolean;
  /** Max quantity that can be added; Infinity when unlimited or oversell is allowed */
  maxQuantity: number;
}

/**
 * Single source of truth for purchasability across ProductCard, the product
 * page, and the cart drawer. availableForSale is authoritative (it already
 * accounts for each variant's own oversell/backorder setting in Shopify
 * admin) — quantityAvailable only caps quantity when it's a genuine positive
 * count; zero/negative values with availableForSale still true mean the
 * merchant has oversell enabled, so there's no real cap to enforce.
 */
export function getStockInfo(
  variant?: { availableForSale?: boolean; quantityAvailable?: number | null } | null
): StockInfo {
  if (!variant || variant.availableForSale === false) {
    return { isOutOfStock: true, maxQuantity: 0 };
  }
  const qty = variant.quantityAvailable;
  const maxQuantity = typeof qty === "number" && qty > 0 ? qty : Infinity;
  return { isOutOfStock: false, maxQuantity };
}

export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        description
        productType
        tags
        concernMetafield: metafield(namespace: "custom", key: "concern") {
          value
        }
        sizeMetafield: metafield(namespace: "custom", key: "size") {
          value
        }
        infoMetafield: metafield(namespace: "custom", key: "info") {
          value
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
            quantityAvailable
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
        image {
          url
        }
      }
    }
  }
`;

export async function fetchCollections(): Promise<{ id: string; title: string; handle: string, image?: { url: string } | null }[]> {
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
          description
          productType
          tags
          concernMetafield: metafield(namespace: "custom", key: "concern") {
            value
          }
          sizeMetafield: metafield(namespace: "custom", key: "size") {
            value
          }
          infoMetafield: metafield(namespace: "custom", key: "info") {
            value
          }
          variants(first: 1) {
            nodes {
              id
              availableForSale
              quantityAvailable
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
      concernMetafield: metafield(namespace: "custom", key: "concern") {
        value
      }
      sizeMetafield: metafield(namespace: "custom", key: "size") {
        value
      }
      benefitsMetafield: metafield(namespace: "custom", key: "benefits") {
        value
      }
      ingredientsMetafield: metafield(namespace: "custom", key: "ingredients") {
        value
      }
      howToUseMetafield: metafield(namespace: "custom", key: "how_to_use") {
        value
      }
      insideTheBoxMetafield: metafield(namespace: "custom", key: "inside_the_box") {
        value
      }
      additionalInfoMetafield: metafield(namespace: "custom", key: "additional_information") {
        value
      }
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
          quantityAvailable
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
      infoMetafield: metafield(namespace: "custom", key: "info") {
        value
      }
      variants(first: 1) {
        nodes {
          id
          availableForSale
          quantityAvailable
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

export const CUSTOMER_ACTIVATE_MUTATION = `
  mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {
    customerActivate(id: $id, input: $input) {
      customer {
        id
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

export const CUSTOMER_RESET_MUTATION = `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
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

export async function activateCustomer(id: string, input: any) {
  try {
    const data: any = await storefrontClient.request(CUSTOMER_ACTIVATE_MUTATION, {
      id,
      input,
    });
    return data.customerActivate;
  } catch (error) {
    console.error("Activation Error:", error);
    return null;
  }
}

export async function resetCustomer(id: string, input: any) {
  try {
    const data: any = await storefrontClient.request(CUSTOMER_RESET_MUTATION, {
      id,
      input,
    });
    return data.customerReset;
  } catch (error) {
    console.error("Reset Password Error:", error);
    return null;
  }
}

export const CUSTOMER_RESET_BY_URL_MUTATION = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
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

export async function resetCustomerByUrl(resetUrl: string, password: string) {
  try {
    const data: any = await storefrontClient.request(
      CUSTOMER_RESET_BY_URL_MUTATION,
      { resetUrl, password }
    );
    return data.customerResetByUrl;
  } catch (error) {
    console.error("Reset By URL Error:", error);
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
          availableForSale
          quantityAvailable
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

export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentityInput: {
    customerAccessToken?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
  }
): Promise<any> {
  try {
    const data: any = await storefrontClient.request(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
      cartId,
      buyerIdentity: buyerIdentityInput,
    });
    return data.cartBuyerIdentityUpdate.cart;
  } catch (error) {
    console.error("Update Cart Buyer Identity Error:", error);
    return null;
  }
}

/**
 * Sanitizes the checkout URL to ensure it points to the Shopify store domain
 * instead of the headless site domain (which might happen if fonts/links use primary domain).
 */
export const SEARCH_PRODUCTS_QUERY = `
  query searchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      nodes {
        ... on Product {
          id
          title
          handle
          tags
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
          images(first: 1) {
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

export async function searchProducts(query: string, limit = 8): Promise<ShopifyProduct[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const data: any = await storefrontClient.request(SEARCH_PRODUCTS_QUERY, {
      query: query.trim(),
      first: limit,
    });
    return data.search?.nodes || [];
  } catch (error) {
    console.error("Search Products Error:", error);
    return [];
  }
}

export function getSafeCheckoutUrl(checkoutUrl: string): string {
  if (!checkoutUrl) return "";

  try {
    const url = new URL(checkoutUrl);
    // Use the env var or a hardcoded fallback if env var is missing during dev
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "indevie-beauty.myshopify.com";

    // If it's already pointing to the shopify domain, we are good
    if (url.hostname.includes("myshopify.com")) {
      return url.toString();
    }

    // Force the hostname to the Shopify domain
    if (shopDomain) {
      url.hostname = shopDomain;
    }

    return url.toString();
  } catch (error) {
    console.error("Error parsing checkout URL:", error);
    return checkoutUrl;
  }
}

export const GET_FEED_PRODUCTS_QUERY = `
  query getFeedProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        description
        productType
        vendor
        tags
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
            image {
              url
              altText
            }
          }
        }
        images(first: 10) {
          nodes {
            url
            altText
          }
        }
      }
    }
  }
`;

export async function fetchAllFeedProducts(): Promise<ShopifyProduct[]> {
  let allProducts: ShopifyProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  const limit = 100; // Fetch 100 products at a time to be safe

  while (hasNextPage) {
    try {
      const data: any = await storefrontClient.request(GET_FEED_PRODUCTS_QUERY, {
        first: limit,
        after: cursor,
      });

      const products = data?.products?.nodes || [];
      allProducts = [...allProducts, ...products];

      hasNextPage = data?.products?.pageInfo?.hasNextPage || false;
      cursor = data?.products?.pageInfo?.endCursor || null;
    } catch (error) {
      console.error("Error fetching page of feed products:", error);
      break;
    }
  }

  return allProducts;
}

