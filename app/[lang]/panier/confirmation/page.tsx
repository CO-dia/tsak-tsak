import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import ClearCart from "@/components/shop/ClearCart";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, href, type Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { finalizePaidSession, formatAddress, getOrderBySession, getOrderItems } from "@/lib/orders";
import { getSettings, localizedSettings } from "@/lib/settings";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/panier/confirmation">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).confirmation.metaTitle, robots: { index: false } };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: PageProps<"/[lang]/panier/confirmation">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <section className="order-confirmation">
      <Suspense fallback={<p className="shop-status">{getDictionary(lang).confirmation.loading}</p>}>
        <Confirmation lang={lang} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Confirmation({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/panier/confirmation">["searchParams"];
}) {
  await connection();
  const t = getDictionary(lang).confirmation;
  const money = (cents: number) => formatMoney(cents, lang);
  const { session_id: sessionId } = await searchParams;
  const sql = await db();
  let order = typeof sessionId === "string" ? await getOrderBySession(sql, sessionId) : null;

  if (!order) {
    return (
      <div className="order-confirmation__inner">
        <p className="eyebrow">{t.notFoundEyebrow}</p>
        <h1>{t.notFoundTitle}</h1>
        <p>{t.notFoundText}</p>
        <Link className="button button--dark" href={href(lang, "shop")}>
          {t.backToShop} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    );
  }

  // Si le webhook n’est pas encore passé, on vérifie directement auprès de Stripe.
  if (order.status === "pending" && order.stripeSessionId && stripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
      order = (await finalizePaidSession(sql, session)) ?? order;
    } catch (error) {
      console.error("[confirmation] Vérification Stripe impossible", error);
    }
  }

  const paid = ["paid", "ready", "completed"].includes(order.status);
  const [items, settings] = await Promise.all([getOrderItems(sql, order.id), getSettings(sql)]);
  const texts = localizedSettings(settings, lang);
  const delivery = order.fulfillment === "delivery";

  return (
    <div className="order-confirmation__inner">
      {paid && <ClearCart />}
      <p className="eyebrow">{paid ? t.orderNumber(order.number) : t.pendingEyebrow}</p>
      <h1>{paid ? t.thanks : t.wait}</h1>
      <p className="order-confirmation__lead">{paid ? t.paidText(order.customerEmail) : t.pendingText}</p>

      <div className="order-confirmation__grid">
        <div>
          <p className="eyebrow">{t.yourOrder}</p>
          <ul className="order-confirmation__items">
            {items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantity} × {lang === "en" && item.nameEn ? item.nameEn : item.name}
                  {item.format ? ` (${item.format})` : ""}
                </span>
                <strong>{money(item.unitPriceCents * item.quantity)}</strong>
              </li>
            ))}
            {delivery && (
              <li>
                <span>{t.delivery}</span>
                <strong>{order.deliveryFeeCents > 0 ? money(order.deliveryFeeCents) : t.free}</strong>
              </li>
            )}
            {order.taxCents > 0 && (
              <li>
                <span>{t.taxes}</span>
                <strong>{money(order.taxCents)}</strong>
              </li>
            )}
            <li className="order-confirmation__total">
              <span>{t.total}</span>
              <strong>{money(order.totalCents)}</strong>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">{delivery ? t.delivery : t.pickup}</p>
          <p className="order-confirmation__place">
            {delivery && order.deliveryAddress ? formatAddress(order.deliveryAddress) : order.pickupLocation}
          </p>
          <p>{delivery ? texts.deliveryInstructions : texts.pickupInstructions}</p>
        </div>
      </div>

      <Link className="button button--dark" href={href(lang, "home")}>
        {t.backHome} <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
