import { addresses, FACEBOOK_URL } from "@/lib/content";
import { INSTAGRAM_URL } from "@/lib/instagram";
import { routes, type Locale } from "@/lib/i18n";
import { menuSections } from "@/lib/menu";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

const sameAs = [INSTAGRAM_URL, FACEBOOK_URL];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Site web et restaurants (schema.org) : nom, adresse, téléphone, heures, menu, réseaux sociaux. */
export function restaurantsJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Tsak Tsak",
        url: SITE_URL,
        inLanguage: ["fr-CA", "en-CA"],
      },
      ...addresses.map((item) => ({
        "@type": "Restaurant",
        "@id": `${SITE_URL}/#${item.number === "01" ? "beaubien" : "saint-laurent"}`,
        name: item.name,
        url: absoluteUrl(routes.locations[lang]),
        telephone: `+1-${item.phone}`,
        email: "resto@tsaktsak.com",
        image: [`${SITE_URL}/opengraph-image.jpg`],
        logo: `${SITE_URL}/brand/logo-dark.png`,
        servesCuisine: ["Brunch", "Malagasy", "Québécoise"],
        priceRange: "$$",
        foundingDate: "2009",
        hasMenu: absoluteUrl(routes.menu[lang]),
        hasMap: item.map,
        sameAs,
        acceptsReservations: item.booking ?? "By phone",
        address: {
          "@type": "PostalAddress",
          streetAddress: item.address,
          addressLocality: "Montréal",
          addressRegion: "QC",
          addressCountry: "CA",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: days,
          opens: "08:30",
          closes: "16:00",
        },
      })),
    ],
  };
}

/** Menu complet (sections, plats, prix en CAD) pour les résultats enrichis de Google. */
export function menuJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: lang === "en" ? "Tsak Tsak menu" : "Menu Tsak Tsak",
    url: absoluteUrl(routes.menu[lang]),
    inLanguage: lang === "en" ? "en-CA" : "fr-CA",
    hasMenuSection: menuSections.map((section) => ({
      "@type": "MenuSection",
      name: section.label[lang],
      hasMenuSection: section.groups.map((group) => ({
        "@type": "MenuSection",
        name: group.title[lang],
        hasMenuItem: group.items.map((item) => ({
          "@type": "MenuItem",
          name: item.name[lang],
          ...(item.description[lang] ? { description: item.description[lang] } : {}),
          ...(item.prices[0]
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.prices[0].amount.toFixed(2),
                  priceCurrency: "CAD",
                },
              }
            : {}),
        })),
      })),
    })),
  };
}
