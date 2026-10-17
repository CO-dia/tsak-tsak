"use client";

import Link from "next/link";

import { useCartLines } from "@/components/shop/cart-store";
import { href, type Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";

/** Barre collante en bas de l’épicerie dès que le panier contient un produit. */
export default function CartBar({
  lang,
  labels,
}: {
  lang: Locale;
  labels: { bar: string; item: string; items: string; checkout: string };
}) {
  const lines = useCartLines();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  if (count === 0) return null;
  const total = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);

  return (
    <div className="cart-bar" role="region" aria-label={labels.bar}>
      <p>
        <span>{labels.bar}</span> {count} {count > 1 ? labels.items : labels.item} · {formatMoney(total, lang)}
      </p>
      <Link className="button button--light" href={href(lang, "cart")}>
        {labels.checkout} <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
