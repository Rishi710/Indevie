export const dynamic = "force-dynamic";
import Image from "next/image";

export default function Home() {
  console.log("STORE:", process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
  return (
    <h1 className="text-5xl text-red-500">Tailwind Working 🚀</h1>
  );
}


// export default async function Home() {
//   try {
//     const res = await fetch(
//       `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-Shopify-Storefront-Access-Token":
//             process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!,
//         },
//         body: JSON.stringify({
//           query: `{
//             shop {
//               name
//             }
//           }`,
//         }),
//       }
//     );

//     const data = await res.json();

//     return (
//       <div>
//         <h1>Connected ✅</h1>
//         <p>{data.data.shop.name}</p>
//       </div>
//     );
//   } catch (err) {
//     return <h1>Connection Failed ❌</h1>;
//   }
// }