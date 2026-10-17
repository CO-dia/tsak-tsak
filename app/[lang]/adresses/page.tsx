import type { Metadata } from "next";
import { notFound } from "next/navigation";

import OpenStatus from "@/components/OpenStatus";
import { Arrow, PageHero } from "@/components/ui";
import { addresses, telHref } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/adresses">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).locations;
  return { title: t.metaTitle, description: t.metaDescription, alternates: alternates(lang, "locations") };
}

// Données structurées pour Google : deux restaurants, adresses et heures.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": addresses.map((item) => ({
    "@type": "Restaurant",
    name: item.name,
    telephone: `+1-${item.phone}`,
    servesCuisine: "Brunch",
    url: "https://tsaktsak.com/adresses",
    address: {
      "@type": "PostalAddress",
      streetAddress: item.address,
      addressLocality: "Montréal",
      addressRegion: "QC",
      addressCountry: "CA",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:30",
      closes: "16:00",
    },
  })),
};

function mapEmbedUrl(query: string, lang: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=${lang}&output=embed`;
}

export default async function AddressesPage({ params }: PageProps<"/[lang]/adresses">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).locations;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <PageHero index={t.index} eyebrow={t.eyebrow} title={t.title} description={t.description} />
      <section className="locations section">
        {addresses.map((item, index) => {
          const shortName = item.name.replace("Tsak Tsak ", "");
          return (
            <article className={`location ${index % 2 === 1 ? "location--reverse" : ""}`} key={item.name}>
              <div className="location__info">
                <div className="location__top">
                  <OpenStatus openLabel={t.openNow(t.closeHour)} closedLabel={t.closedNow(t.openHour)} />
                  <span className="location__number">
                    {item.number} / {String(addresses.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="location__brand">Tsak Tsak</p>
                <h2>{shortName}</h2>
                <dl className="location__details">
                  <div>
                    <dt>{t.address}</dt>
                    <dd>
                      {item.address}
                      <br />
                      Montréal (Québec)
                    </dd>
                  </div>
                  <div>
                    <dt>{t.phone}</dt>
                    <dd>
                      <a href={telHref(item.phone)}>{item.phone}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.hours}</dt>
                    <dd>{t.hoursValue}</dd>
                  </div>
                </dl>
                <div className="location__buttons">
                  {item.booking ? (
                    <a className="button button--reserve" href={item.booking} target="_blank" rel="noreferrer">
                      {t.book} <Arrow />
                    </a>
                  ) : (
                    <a className="button button--reserve" href={telHref(item.phone)}>
                      {t.bookByPhone} · {item.phone}
                    </a>
                  )}
                  <a className="button button--ghost" href={item.map} target="_blank" rel="noreferrer">
                    {t.directions}
                  </a>
                </div>
              </div>
              <div className="location__map">
                <iframe
                  src={mapEmbedUrl(item.mapQuery, lang)}
                  title={`${item.name} — Google Maps`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <a className="location__map-link" href={item.map} target="_blank" rel="noreferrer" aria-label={t.openMap(item.name)}>
                  <span>
                    {t.mapLabel} <Arrow />
                  </span>
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
