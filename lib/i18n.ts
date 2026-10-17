/**
 * Langues du site. Le français est servi sans préfixe (/a-propos), l’anglais sous /en avec des
 * adresses traduites (/en/about). proxy.ts réécrit ces adresses vers app/[lang]/… (dossiers en
 * français). Ce fichier est utilisé côté serveur et côté navigateur.
 */
export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export type RouteKey =
  | "home"
  | "about"
  | "menu"
  | "locations"
  | "catering"
  | "shop"
  | "cart"
  | "confirmation";

/** Adresse publique de chaque page, par langue. */
export const routes: Record<RouteKey, Record<Locale, string>> = {
  home: { fr: "/", en: "/en" },
  about: { fr: "/a-propos", en: "/en/about" },
  menu: { fr: "/menu", en: "/en/menu" },
  locations: { fr: "/adresses", en: "/en/locations" },
  catering: { fr: "/traiteur", en: "/en/catering" },
  shop: { fr: "/epicerie", en: "/en/shop" },
  cart: { fr: "/panier", en: "/en/cart" },
  confirmation: { fr: "/panier/confirmation", en: "/en/cart/confirmation" },
};

export function href(lang: Locale, route: RouteKey) {
  return routes[route][lang];
}

function trim(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

/**
 * Page (clé) correspondant à une adresse, dans l’une ou l’autre langue. Accepte aussi les
 * adresses internes (/fr/a-propos, /en/a-propos) : c’est ce que voit le rendu serveur après la
 * réécriture de proxy.ts, alors que le navigateur voit l’adresse publique. Les deux donnent la
 * même clé, donc le même rendu (pas d’écart à l’hydratation).
 */
export function routeFromPath(pathname: string): RouteKey | null {
  let clean = trim(pathname);
  if (clean === "/fr" || clean.startsWith("/fr/")) clean = clean.slice(3) || "/";
  for (const [key, paths] of Object.entries(routes) as [RouteKey, Record<Locale, string>][]) {
    if (paths.fr === clean || paths.en === clean) return key;
    if (paths.fr !== "/" && `/en${paths.fr}` === clean) return key;
  }
  return null;
}

/** Même page dans l’autre langue (pour le sélecteur FR / EN). */
export function translatePath(pathname: string, target: Locale) {
  const route = routeFromPath(pathname);
  return route ? routes[route][target] : routes.home[target];
}

/**
 * Adresse interne (dossier app/[lang]/…) d’une adresse anglaise publique.
 * /en/about → /en/a-propos ; retourne null si l’adresse n’est pas une page connue.
 */
export function internalEnglishPath(pathname: string) {
  const clean = trim(pathname);
  const route = (Object.keys(routes) as RouteKey[]).find((key) => routes[key].en === clean);
  if (!route) return null;
  const internal = routes[route].fr;
  return internal === "/" ? "/en" : `/en${internal}`;
}

export const htmlLang: Record<Locale, string> = { fr: "fr-CA", en: "en-CA" };
