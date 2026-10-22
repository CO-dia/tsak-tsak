import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import CartCheckout from "@/components/shop/CartCheckout";
import ComingSoon from "@/components/shop/ComingSoon";
import { PageHero } from "@/components/ui";
import { pickupLocations } from "@/lib/checkout";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, type Locale } from "@/lib/i18n";
import { listActiveProducts, toPublicProduct } from "@/lib/products";
import { alternates } from "@/lib/seo";
import { shopHidden } from "@/lib/shop-status";
import { getSettings, localizedSettings } from "@/lib/settings";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/panier">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: getDictionary(lang).cart.metaTitle,
    robots: { index: false },
    alternates: alternates(lang, "cart"),
  };
}

export default async function CartPage({
  params,
  searchParams,
}: PageProps<"/[lang]/panier">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).cart;

  return (
    <>
      <PageHero
        compact
        index={t.index}
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <section className="section cart-page">
        <Suspense fallback={<p className="shop-status">{t.loading}</p>}>
          <Checkout lang={lang} searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function Checkout({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/panier">["searchParams"];
}) {
  await connection();
  const { paiement } = await searchParams;
  const sql = await db();
  if (await shopHidden(sql)) return <ComingSoon lang={lang} />;
  const [products, settings] = await Promise.all([
    listActiveProducts(sql),
    getSettings(sql),
  ]);
  const texts = localizedSettings(settings, lang);

  return (
    <CartCheckout
      lang={lang}
      products={products.map((product) => toPublicProduct(product, lang))}
      settings={{
        shopOpen: settings.shopOpen,
        closedMessage: texts.closedMessage,
        pickupEnabled: settings.pickupEnabled,
        pickupInstructions: texts.pickupInstructions,
        deliveryEnabled: settings.deliveryEnabled,
        deliveryFeeCents: settings.deliveryFeeCents,
        deliveryInstructions: texts.deliveryInstructions,
        taxesEnabled: settings.taxesEnabled,
      }}
      pickupLocations={pickupLocations}
      mapsApiKey={process.env.GOOGLE_MAPS_API_KEY ?? null}
      paymentCancelled={paiement === "annule"}
    />
  );
}
