import type { MetadataRoute } from "next";

import { locales, routes, type RouteKey } from "@/lib/i18n";

const SITE = "https://tsaktsak.com";
const pages: RouteKey[] = ["home", "about", "menu", "locations", "catering", "shop"];

// Chaque page dans les deux langues, avec ses versions linguistiques.
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((page) =>
    locales.map((lang) => ({
      url: `${SITE}${routes[page][lang]}`,
      changeFrequency: "monthly" as const,
      priority: page === "home" ? 1 : 0.8,
      alternates: {
        languages: {
          "fr-CA": `${SITE}${routes[page].fr}`,
          "en-CA": `${SITE}${routes[page].en}`,
        },
      },
    })),
  );
}
