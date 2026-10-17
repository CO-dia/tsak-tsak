"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import { useCartCount } from "@/components/shop/cart-store";
import { Logo } from "@/components/ui";
import { RESERVATION_URL } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { href, routeFromPath, translatePath, type Locale, type RouteKey } from "@/lib/i18n";

const links: RouteKey[] = ["about", "menu", "locations", "catering", "shop"];

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" strokeLinejoin="round" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" strokeLinecap="round" />
    </svg>
  );
}

function LanguageSwitch({ lang, pathname }: { lang: Locale; pathname: string }) {
  const t = getDictionary(lang).nav;
  return (
    <div className="lang-switch" aria-label={t.language} role="group">
      {(["fr", "en"] as const).map((locale, index) => (
        <span key={locale}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {locale === lang ? (
            <span className="lang-switch__current" aria-current="true">
              {locale.toUpperCase()}
            </span>
          ) : (
            <Link
              href={translatePath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-label={locale === "en" ? "English" : "Français"}
            >
              {locale.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

export default function Header({ lang }: { lang: Locale }) {
  return <HeaderView lang={lang} pathname={usePathname()} />;
}

/**
 * En-tête sans lien actif, pour le prérendu des pages dont l’adresse n’est connue qu’à la requête
 * (page 404 du segment [...rest]).
 */
export function HeaderView({ lang, pathname }: { lang: Locale; pathname: string | null }) {
  const t = getDictionary(lang).nav;
  const count = useCartCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 40,
    () => false,
  );
  const current = pathname === null ? null : routeFromPath(pathname);
  const solid = current !== "home" || scrolled || menuOpen;

  const cartLink = (className: string) => (
    <Link
      className={`cart-link ${className} ${current === "cart" ? "active" : ""}`}
      href={href(lang, "cart")}
      aria-label={t.cartLabel(count)}
      onClick={() => setMenuOpen(false)}
    >
      <BagIcon />
      <span className="cart-link__count" aria-hidden="true">
        {count}
      </span>
    </Link>
  );

  return (
    <header className={`header ${solid ? "header--solid" : ""}`}>
      <Link
        className="header__logo"
        href={href(lang, "home")}
        aria-label={t.home}
        onClick={() => setMenuOpen(false)}
      >
        <Logo light={!solid} />
      </Link>

      <nav
        id="navigation"
        className={`nav ${menuOpen ? "nav--open" : ""}`}
        aria-label={t.main}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
        }}
      >
        {links.map((route) => {
          const active = current === route;
          return (
            <Link
              key={route}
              href={href(lang, route)}
              className={active ? "active" : undefined}
              aria-current={current === route ? "page" : undefined}
            >
              {t[route as "about" | "menu" | "locations" | "catering" | "shop"]}
            </Link>
          );
        })}
        <LanguageSwitch lang={lang} pathname={pathname ?? "/"} />
        {cartLink("cart-link--desktop")}
        <a
          className="button button--nav button--reserve"
          href={RESERVATION_URL}
          target="_blank"
          rel="noreferrer"
        >
          {t.book}
        </a>
      </nav>

      <div className="header__actions">
        {cartLink("cart-link--mobile")}
        <button
          className={`menu-toggle ${menuOpen ? "menu-toggle--open" : ""}`}
          type="button"
          aria-label={menuOpen ? t.close : t.open}
          aria-expanded={menuOpen}
          aria-controls="navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
