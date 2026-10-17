import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/panier", "/en/cart", "/api"] },
    sitemap: "https://tsaktsak.com/sitemap.xml",
  };
}
