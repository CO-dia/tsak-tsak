import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Footer from "@/components/Footer";
import Header, { HeaderView } from "@/components/Header";
import { getDictionary } from "@/lib/dictionaries";
import { fontVariables } from "@/lib/fonts";
import { hasLocale, htmlLang, locales } from "@/lib/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta;
  return {
    metadataBase: new URL("https://tsaktsak.com"),
    title: { default: t.title, template: "%s — Tsak Tsak" },
    description: t.description,
    openGraph: {
      type: "website",
      locale: t.ogLocale,
      siteName: "Tsak Tsak",
      title: t.title,
      description: t.description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#3b2a20",
};

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={htmlLang[lang]} className={fontVariables}>
      <body>
        <a className="skip-link" href="#contenu">
          {t.nav.skip}
        </a>
        <div className="site-shell">
          <Suspense fallback={<HeaderView lang={lang} pathname={null} />}>
            <Header lang={lang} />
          </Suspense>
          <main id="contenu">{children}</main>
          <Footer lang={lang} />
        </div>
      </body>
    </html>
  );
}
