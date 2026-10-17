import { routes, type Locale, type RouteKey } from "@/lib/i18n";

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
