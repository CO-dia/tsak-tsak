import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MenuTabs from "@/components/MenuTabs";
import { PageHero } from "@/components/ui";
import { menuSections } from "@/lib/menu";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).menu;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(lang, "menu") };
}

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
      items: group.items.map((item) => ({
        name: item.name[lang],
        description: item.description[lang],
        note: item.note[lang],
        price: item.prices
          .map((price) => (price.label ? `${price.label[lang]} ${money(price.amount)}` : money(price.amount)))
          .join(" · "),
      })),
    })),
  }));

  return (
    <>
      <PageHero index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="menu-page section">
        <MenuTabs
          sections={sections}
          labels={{ tabs: t.tabsLabel, alaCarte: t.alaCarte, note: t.note }}
        />
      </section>
    </>
  );
}
