import { getDictionary } from "@/lib/dictionaries";
import { routes, type Locale, type RouteKey } from "@/lib/i18n";

export const SITE_URL = "https://tsaktsak.com";

/** Image de partage (Facebook, WhatsApp, Google…) : 1200 × 630, servie par app/opengraph-image.jpg. */
export const OG_IMAGE = { url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "Tsak Tsak" };

/** Adresse absolue à partir d’un chemin (/menu → https://tsaktsak.com/menu). */
export function absoluteUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Adresse canonique et versions linguistiques (hreflang) d’une page. */
export function alternates(lang: Locale, route: RouteKey) {
  return {
    canonical: routes[route][lang],
    languages: {
      "fr-CA": routes[route].fr,
      "en-CA": routes[route].en,
      "x-default": routes[route].fr,
    },
  };
}

/**
 * Métadonnées complètes d’une page : titre, description, adresse canonique, hreflang, Open Graph
 * et carte Twitter. Sans `title`, le titre par défaut du site (accueil) est utilisé.
 */
export function pageMetadata({
  lang,
  route,
  title,
  description,
}: {
  lang: Locale;
  route: RouteKey;
  title?: string;
  description: string;
}) {
  const meta = getDictionary(lang).meta;
  const fullTitle = title ? `${title} — Tsak Tsak` : meta.title;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: alternates(lang, route),
    openGraph: {
      type: "website" as const,
      url: routes[route][lang],
      siteName: "Tsak Tsak",
      locale: meta.ogLocale,
      alternateLocale: lang === "fr" ? "en_CA" : "fr_CA",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image" as const, title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}
