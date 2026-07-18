import { NextRequest } from "next/server";
import { fetchAllFeedProducts } from "@/lib/shopify";

export const dynamic = "force-dynamic";

function escapeCdata(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/]]>/g, "]]&gt;");
}

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

function formatPrice(amount: string, currencyCode: string): string {
  const parsed = parseFloat(amount);
  return `${parsed.toFixed(2)} ${currencyCode}`;
}

function getNumericId(gid: string): string {
  return gid.split("/").pop() || "";
}

function getFormattedId(
  productId: string,
  variantId: string,
  format: string | null,
  defaultGid: string
): string {
  if (format && format.toLowerCase().startsWith("shopify_")) {
    const country = format.split("_")[1] || "IN";
    const pNum = getNumericId(productId);
    const vNum = getNumericId(variantId);
    return `shopify_${country.toUpperCase()}_${pNum}_${vNum}`;
  }
  return defaultGid;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const isVariantLevel = searchParams.get("variant") === "true";
  const idFormat = searchParams.get("id_format"); // e.g., shopify_in, shopify_us

  // Resolve absolute base URL dynamically (e.g., localhost or production domain)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "www.indevie.com";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const products = await fetchAllFeedProducts();

  let itemsXml = "";

  for (const product of products) {
    if (isVariantLevel) {
      const variants = product.variants?.nodes || [];
      for (const variant of variants) {
        const title = variant.title && variant.title !== "Default Title" 
          ? `${product.title} - ${variant.title}` 
          : product.title;

        const description = product.description || product.title;
        const mainImage = variant.image?.url || product.images?.nodes[0]?.url || "";
        const additionalImages = product.images?.nodes
          .map((img) => img.url)
          .filter((url) => url !== mainImage)
          .slice(0, 9); // Limit to 10 total images (1 main + 9 additional)

        const brand = product.vendor || "Indevie";
        const availability = variant.availableForSale ? "in stock" : "out of stock";
        const numericVariantId = getNumericId(variant.id);
        const link = `${baseUrl}/products/${product.handle}?variant=${numericVariantId}`;

        // Generate Item ID
        const itemId = getFormattedId(product.id, variant.id, idFormat, variant.id);

        // Price formatting
        let priceXml = "";
        const currentPrice = formatPrice(variant.price.amount, variant.price.currencyCode);
        if (variant.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)) {
          const originalPrice = formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode);
          priceXml = `
      <g:price>${originalPrice}</g:price>
      <g:sale_price>${currentPrice}</g:sale_price>`;
        } else {
          priceXml = `
      <g:price>${currentPrice}</g:price>`;
        }

        let additionalImagesXml = "";
        if (additionalImages.length > 0) {
          additionalImagesXml = additionalImages
            .map((url) => `      <g:additional_image_link><![CDATA[${url}]]></g:additional_image_link>`)
            .join("\n");
        }

        itemsXml += `    <item>
      <g:id>${itemId}</g:id>
      <g:item_group_id>${product.id}</g:item_group_id>
      <g:title><![CDATA[${escapeCdata(title)}]]></g:title>
      <g:description><![CDATA[${escapeCdata(cleanText(description))}]]></g:description>
      <g:link><![CDATA[${link}]]></g:link>
      <g:image_link><![CDATA[${mainImage}]]></g:image_link>
      <g:brand><![CDATA[${escapeCdata(brand)}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>${priceXml}
${additionalImagesXml}
      <g:google_product_category><![CDATA[Health & Beauty > Personal Care > Cosmetics]]></g:google_product_category>
      <g:product_type><![CDATA[${escapeCdata(product.productType || "")}]]></g:product_type>
    </item>\n`;
      }
    } else {
      // Product-level feed (default)
      const firstVariant = product.variants?.nodes[0];
      if (!firstVariant) continue;

      const title = product.title;
      const description = product.description || product.title;
      const mainImage = product.images?.nodes[0]?.url || "";
      const additionalImages = product.images?.nodes
        .slice(1, 10)
        .map((img) => img.url);

      const brand = product.vendor || "Indevie";
      // Product is in stock if any variant is available
      const isAnyVariantAvailable = product.variants?.nodes.some((v) => v.availableForSale) ?? false;
      const availability = isAnyVariantAvailable ? "in stock" : "out of stock";
      const link = `${baseUrl}/products/${product.handle}`;

      // Generate Item ID
      const itemId = getFormattedId(product.id, firstVariant.id, idFormat, product.id);

      // Price formatting from first variant
      let priceXml = "";
      const currentPrice = formatPrice(firstVariant.price.amount, firstVariant.price.currencyCode);
      if (firstVariant.compareAtPrice && parseFloat(firstVariant.compareAtPrice.amount) > parseFloat(firstVariant.price.amount)) {
        const originalPrice = formatPrice(firstVariant.compareAtPrice.amount, firstVariant.compareAtPrice.currencyCode);
        priceXml = `
      <g:price>${originalPrice}</g:price>
      <g:sale_price>${currentPrice}</g:sale_price>`;
      } else {
        priceXml = `
      <g:price>${currentPrice}</g:price>`;
      }

      let additionalImagesXml = "";
      if (additionalImages.length > 0) {
        additionalImagesXml = additionalImages
          .map((url) => `      <g:additional_image_link><![CDATA[${url}]]></g:additional_image_link>`)
          .join("\n");
      }

      itemsXml += `    <item>
      <g:id>${itemId}</g:id>
      <g:title><![CDATA[${escapeCdata(title)}]]></g:title>
      <g:description><![CDATA[${escapeCdata(cleanText(description))}]]></g:description>
      <g:link><![CDATA[${link}]]></g:link>
      <g:image_link><![CDATA[${mainImage}]]></g:image_link>
      <g:brand><![CDATA[${escapeCdata(brand)}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>${priceXml}
${additionalImagesXml}
      <g:google_product_category><![CDATA[Health & Beauty > Personal Care > Cosmetics]]></g:google_product_category>
      <g:product_type><![CDATA[${escapeCdata(product.productType || "")}]]></g:product_type>
    </item>\n`;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Indevie Product Feed</title>
    <link>${baseUrl}</link>
    <description>Dynamic product feed for Indevie Headless Storefront</description>
    <language>en</language>
${itemsXml}  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
