import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Arrow, PageHero } from "@/components/ui";
import brunchImage from "@/assets/images/food4.webp";
import { foodGallery } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, href } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).about;
  return { title: t.metaTitle, description: t.description, alternates: alternates(lang, "about") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).about;

  return (
    <>
      <PageHero index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="cuisine section cuisine--page">
        <div className="cuisine__copy">
          <p className="eyebrow">{t.tableEyebrow}</p>
          <p className="section-index">{t.tableIndex}</p>
          <h2>{t.tableTitle}</h2>
          <p className="body-copy">{t.tableText}</p>
          <ul className="checklist">
            {t.points.map((point, index) => (
              <li key={point}>
                <span>0{index + 1}</span> {point}
              </li>
            ))}
          </ul>
          <Link className="button button--dark" href={href(lang, "shop")}>
            {t.shopLink} <Arrow />
          </Link>
        </div>
        <div className="cuisine__visual">
          <Image src={brunchImage} alt={t.imageAlt} sizes="(max-width: 760px) 100vw, 56vw" placeholder="blur" />
          <div className="year-badge" aria-label={t.since}>
            {t.since}
          </div>
        </div>
      </section>
      <section className="food-gallery" aria-label={t.galleryLabel}>
        {foodGallery.map((photo) => (
          <figure className="food-gallery__item" key={photo.label.fr}>
            <Image src={photo.src} alt={photo.alt[lang]} sizes="(max-width: 760px) 50vw, 25vw" placeholder="blur" />
            <figcaption>{photo.label[lang]}</figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
