import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import CateringForm from "@/components/CateringForm";
import { Arrow, PageHero } from "@/components/ui";
import { addresses, cateringPhotos, eventLocations, eventTypes, telHref } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/traiteur">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).catering;
  return pageMetadata({ lang, route: "catering", title: t.metaTitle, description: t.metaDescription });
}

export default async function CateringPage({ params }: PageProps<"/[lang]/traiteur">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).catering;
  const option = (item: { value: string; en: string }) => ({
    value: item.value,
    label: lang === "en" ? item.en : item.value,
  });

  return (
    <>
      <PageHero
        index={t.index}
        eyebrow={t.eyebrow}
        title={t.title}
        actions={
          <a className="button button--dark" href="#demande">
            {t.requestButton} <Arrow />
          </a>
        }
      />
      <section className="catering-gallery section">
        {[cateringPhotos.slice(0, 4), cateringPhotos.slice(4)].map((photos, block) => (
          <div
            className={`catering-gallery__grid ${block === 1 ? "catering-gallery__grid--reverse" : ""}`}
            key={block}
          >
            {photos.map((photo, index) => (
              <figure className="catering-photo" key={photo.src.src}>
                <Image
                  src={photo.src}
                  alt={photo.alt[lang]}
                  sizes={index === 0 ? "(max-width: 760px) 100vw, 42vw" : "(max-width: 760px) 50vw, 30vw"}
                  placeholder="blur"
                  style={{ objectPosition: photo.position }}
                />
              </figure>
            ))}
          </div>
        ))}
      </section>
      <section className="event-request" id="demande">
        <div className="event-request__intro">
          <p className="eyebrow">{t.requestEyebrow}</p>
          <h2>
            {t.requestTitle} <em>{t.requestTitleEm}</em>
          </h2>
          <p>{t.requestText}</p>
          <div className="event-request__phone">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <div>
              <p>{t.phoneQuestion}</p>
              <ul className="event-request__phones">
                {addresses.map((item) => (
                  <li key={item.phone}>
                    <span>
                      {item.name}
                      {lang === "fr" ? "\u00a0:" : ":"}
                    </span>
                    <a href={telHref(item.phone)}>{item.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <CateringForm
          lang={lang}
          labels={t.form}
          eventTypes={eventTypes.map(option)}
          eventLocations={eventLocations.map(option)}
        />
      </section>
    </>
  );
}
