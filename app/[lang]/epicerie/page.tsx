import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import CartBar from "@/components/shop/CartBar";
import ComingSoon from "@/components/shop/ComingSoon";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { PageHero } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, type Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { categoryName, listActiveProducts, listCategories, toPublicProduct } from "@/lib/products";
import { alternates } from "@/lib/seo";
import { shopComingSoon } from "@/lib/shop-status";
import { getSettings, localizedSettings } from "@/lib/settings";

export async function generateMetadata({ params }: PageProps<"/[lang]/epicerie">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).shop;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(lang, "shop") };
}

export default async function ShopPage({ params, searchParams }: PageProps<"/[lang]/epicerie">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).shop;

  return (
    <>
      <PageHero index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="shop section shop--page">
        <Suspense fallback={<p className="shop-status">{t.loading}</p>}>
          <Catalog lang={lang} searchParams={searchParams} />
        </Suspense>
      </section>
      <CartBar
        lang={lang}
        labels={{ bar: t.bar, item: t.barItem, items: t.barItems, checkout: t.checkout }}
      />
    </>
  );
}

function Icon({ name }: { name: "store" | "truck" | "lock" }) {
  const paths = {
    store: "M4 10.5 5.5 5h13L20 10.5M5 10.5V19h14v-8.5M4 10.5h16M10 19v-5h4v5",
    truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    lock: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",
  };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

async function Catalog({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/epicerie">["searchParams"];
}) {
  // Lu à chaque requête (stock et prix toujours à jour), jamais pendant le build.
  await connection();
  const t = getDictionary(lang).shop;
  if (shopComingSoon()) return <ComingSoon lang={lang} />;
  const { categorie } = await searchParams;

  let data;
  try {
    const sql = await db();
    const [products, categories, settings] = await Promise.all([
      listActiveProducts(sql),
      listCategories(sql),
      getSettings(sql),
    ]);
    data = { products, categories, settings };
  } catch (error) {
    console.error("[épicerie] Lecture des produits impossible", error);
    return <p className="shop-status">{t.unavailable}</p>;
  }

  const { products, categories, settings } = data;
  const texts = localizedSettings(settings, lang);
  const info = [
    settings.pickupEnabled && { icon: "store" as const, title: t.pickupTitle, text: t.pickupText },
    settings.deliveryEnabled && {
      icon: "truck" as const,
      title: t.deliveryTitle,
      text:
        settings.deliveryFeeCents > 0
          ? t.deliveryFee(formatMoney(settings.deliveryFeeCents, lang))
          : t.deliveryFree,
    },
    { icon: "lock" as const, title: t.paymentTitle, text: t.paymentText },
  ].filter((item) => item !== false);

  return (
    <>
      <ul className="shop-info">
        {info.map((item) => (
          <li key={item.title}>
            <Icon name={item.icon} />
            <div>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
      {!settings.shopOpen && <p className="shop-notice">{texts.closedMessage}</p>}
      <ShopCatalog
        lang={lang}
        products={products.map((product) => toPublicProduct(product, lang))}
        categories={categories.map((category) => ({
          id: category.id,
          slug: category.slug,
          name: categoryName(category, lang),
        }))}
        initialCategory={typeof categorie === "string" ? categorie : null}
        shopOpen={settings.shopOpen}
        labels={{
          all: t.all,
          filterLabel: t.filterLabel,
          add: t.add,
          added: t.added,
          soldOut: t.soldOut,
          comingSoon: t.comingSoon,
          maxInCart: t.maxInCart,
          empty: t.empty,
          countSingular: t.countSingular,
          countPlural: t.countPlural,
        }}
      />
    </>
  );
}
