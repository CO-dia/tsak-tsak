import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

/** Remplace l’épicerie et le panier tant que SHOP_COMING_SOON est activée. */
export default function ComingSoon({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).shop.soon;
  return (
    <div className="shop-soon">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2>{t.title}</h2>
      <p>{t.text}</p>
      <Link className="button button--dark" href={href(lang, "menu")}>
        {t.cta} <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
