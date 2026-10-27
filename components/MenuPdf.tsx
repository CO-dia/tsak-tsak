"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PAGE_COUNT = 8;

// Page du PDF où commence chaque section.
export const pdfPages: Record<string, number> = {
  boissons: 1,
  brunch: 2,
  sandwichs: 4,
  crepes: 5,
  diner: 6,
  desserts: 7,
  soir: 8,
};

export default function MenuPdf({
  sections,
  labels,
}: {
  sections: { id: string; label: string }[];
  labels: { tabs: string; open: string; page: string };
}) {
  const [current, setCurrent] = useState(1);

  // Met en avant le bouton de la section dont la page est à l’écran.
  useEffect(() => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-menu-page]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(Number((entry.target as HTMLElement).dataset.menuPage));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, []);

  const entries = sections
    .map((section) => ({ ...section, page: pdfPages[section.id] }))
    .filter((section) => section.page);
  // La section active est celle dont la première page est la plus proche en dessous de la page affichée.
  const activeId = [...entries].filter((entry) => entry.page <= current).sort((a, b) => b.page - a.page)[0]?.id;

  const go = (page: number) => {
    document.getElementById(`menu-page-${page}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="menu-tabs">
        <div className="menu-tabs__scroll" role="navigation" aria-label={labels.tabs}>
          {entries.map((entry) => (
            <button
              className={entry.id === activeId ? "menu-tab menu-tab--active" : "menu-tab"}
              type="button"
              key={entry.id}
              onClick={() => go(entry.page)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-pdf">
        {Array.from({ length: PAGE_COUNT }, (_, index) => index + 1).map((page) => (
          <div className="menu-pdf__page" id={`menu-page-${page}`} data-menu-page={page} key={page}>
            <Image
              src={`/menu-pdf/page-${page}.jpg`}
              alt={`${labels.page} ${page}`}
              width={1275}
              height={1650}
              sizes="(max-width: 900px) 100vw, 860px"
              priority={page === 1}
            />
          </div>
        ))}
        <a className="menu-pdf__link" href="/menu-tsak-tsak.pdf" target="_blank" rel="noopener">
          {labels.open}
        </a>
      </div>
    </>
  );
}
