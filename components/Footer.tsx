import Link from "next/link";

import { Arrow, Logo } from "@/components/ui";
import SocialLinks from "@/components/SocialLinks";
import { CONTACT_EMAIL, RESERVATION_URL, addresses, telHref } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <Logo light />
          <p>{t.footer.tagline}</p>
        </div>
        <div className="footer__column">
          <p className="footer__label">{t.footer.visit}</p>
          <Link href={href(lang, "about")}>{t.nav.about}</Link>
          <Link href={href(lang, "menu")}>{t.nav.menu}</Link>
          <Link href={href(lang, "locations")}>{t.nav.locations}</Link>
          <Link href={href(lang, "catering")}>{t.nav.catering}</Link>
          <Link href={href(lang, "shop")}>{t.nav.shop}</Link>
        </div>
        <div className="footer__column">
          <p className="footer__label">{t.footer.contact}</p>
          {addresses.map((item) => (
            <a key={item.phone} className="footer__phone" href={telHref(item.phone)}>
              <span>{item.name.replace("Tsak Tsak ", "")}</span>
              {item.phone}
            </a>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <SocialLinks className="social-links--footer" />
        </div>
        <div className="footer__reserve">
          <p>{t.footer.reserve}</p>
          <a
            className="button button--outline-light button--reserve"
            href={RESERVATION_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t.nav.book} <Arrow />
          </a>
        </div>
      </div>
      <div className="footer__bottom">
        <p>{t.footer.copyright}</p>
        <Link href={href(lang, "home")}>{t.footer.backHome}</Link>
      </div>
    </footer>
  );
}
