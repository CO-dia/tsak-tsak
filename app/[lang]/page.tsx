import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import InstagramFeed from "@/components/InstagramFeed";
import { Arrow } from "@/components/ui";
import heroImage from "@/assets/images/resto1.webp";
import { RESERVATION_URL } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { restaurantsJsonLd } from "@/lib/structured-data";
import { hasLocale, href, type RouteKey } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return pageMetadata({ lang, route: "home", description: getDictionary(lang).meta.description });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const [first, second, third] = t.home.banner;

  return (
    <>
      <JsonLd data={restaurantsJsonLd(lang)} />
      <section className="hero">
        <Image className="hero__image" src={heroImage} alt={t.home.heroAlt} preload sizes="100vw" placeholder="blur" />
        <div className="hero__shade" />
        <div className="hero__content">
          <p className="eyebrow eyebrow--light">{t.home.eyebrow}</p>
          <h1 className="hero__title">
            <span>{t.home.welcome}</span>
            Tsak Tsak
          </h1>
          <p className="hero__intro">{t.home.intro}</p>
          <div className="hero__buttons">
            <a className="button button--light button--reserve" href={RESERVATION_URL} target="_blank" rel="noreferrer">
              {t.nav.book} <Arrow />
            </a>
            <Link className="button button--outline-light" href={href(lang, "menu")}>
              {t.home.seeMenu}
            </Link>
          </div>
        </div>
        <p className="hero__side-note">{t.home.sideNote}</p>
        <a className="hero__scroll" href="#decouvrir">
          {t.home.discover} <span aria-hidden="true">↓</span>
        </a>
      </section>

      <div className="static-banner" aria-label={`${first}, ${second}, ${third}`}>
        <span>
          {first} <i>—</i> {second} <i>—</i> {third}
        </span>
      </div>

      <section className="home-intro section" id="decouvrir">
        <div className="home-intro__heading">
          <p className="eyebrow">{t.home.introEyebrow}</p>
          <h2>{t.home.introTitle}</h2>
        </div>
        <div className="home-links">
          {t.home.links.map((link) => (
            <Link className="home-link" href={href(lang, link.route as RouteKey)} key={link.route}>
              <span>{link.index}</span>
              <h3>{link.title}</h3>
              <p>{link.text}</p>
              <Arrow />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-about section" aria-labelledby="home-about-title">
        <h2 id="home-about-title">{t.home.about.title}</h2>
        <div>
          <p>{t.home.about.text1}</p>
          <p>{t.home.about.text2}</p>
          <div className="home-about__links">
            <Link className="button button--dark" href={href(lang, "menu")}>
              {t.home.about.menu} <Arrow />
            </Link>
            <Link className="button button--ghost" href={href(lang, "locations")}>
              {t.home.about.locations}
            </Link>
            <Link className="button button--ghost" href={href(lang, "catering")}>
              {t.home.about.catering}
            </Link>
          </div>
        </div>
      </section>

      <InstagramFeed lang={lang} />
    </>
  );
}
