import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MenuPdf from "@/components/MenuPdf";
import MenuTabs from "@/components/MenuTabs";
import { PageHero } from "@/components/ui";
import { groupPhotos, itemPhotos, menuSections } from "@/lib/menu";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { menuJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).menu;
  return pageMetadata({ lang, route: "menu", title: t.metaTitle, description: t.metaDescription });
}

// Pour l’instant, le menu affiché est le PDF de la carte. Passer à false pour revenir à la version
// interactive (fiches de plats avec photos, composant MenuTabs).
const SHOW_PDF_MENU = true;

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).menu;

  // Le menu est envoyé déjà traduit et formaté au composant interactif.
  const money = (amount: number) =>
    new Intl.NumberFormat(lang === "en" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);

  const sections = menuSections.map((section) => ({
    id: section.id,
    number: section.number,
    label: section.label[lang],
    note: section.note[lang],
    groups: section.groups.map((group) => ({
      title: group.title[lang],
      note: group.note[lang],
      photo: groupPhotos[`${section.id}/${group.title.fr}`] ?? null,
      items: group.items.map((item) => ({
        name: item.name[lang],
        description: item.description[lang],
        note: item.note[lang],
        photo: itemPhotos[item.name.fr] ?? null,
        price: item.prices
          .map((price) => (price.label ? `${price.label[lang]} ${money(price.amount)}` : money(price.amount)))
          .join(" · "),
      })),
    })),
  }));

  return (
    <>
      <JsonLd data={menuJsonLd(lang)} />
      <PageHero index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="menu-page section">
        {SHOW_PDF_MENU ? (
          <MenuPdf
            sections={sections.map(({ id, label }) => ({ id, label }))}
            labels={{
              tabs: t.tabsLabel,
              open: lang === "en" ? "Open the PDF menu" : "Ouvrir le menu en PDF",
              page: lang === "en" ? "Menu page" : "Page du menu",
              close: lang === "en" ? "Close" : "Fermer",
              nav: lang === "en" ? "Sections" : "Sections",
            }}
          />
        ) : (
          <MenuTabs
            sections={sections}
            labels={{ tabs: t.tabsLabel, alaCarte: t.alaCarte, note: t.note }}
          />
        )}
      </section>
    </>
  );
}
