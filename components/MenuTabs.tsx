"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Section = {
  id: string;
  number: string;
  label: string;
  note: string;
  groups: {
    title: string;
    note: string;
    photo: string | null;
    items: { name: string; description: string; note: string; photo: string | null; price: string }[];
  }[];
};

export default function MenuTabs({
  sections,
  labels,
}: {
  sections: Section[];
  labels: { tabs: string; alaCarte: string; note: string };
}) {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const topRef = useRef<HTMLDivElement>(null);
  const section = sections.find((item) => item.id === activeSection) ?? sections[0];

  const choose = (id: string) => {
    setActiveSection(id);
    // Revient en haut de la carte pour ne pas rester au milieu de l’ancienne section.
    requestAnimationFrame(() => {
      const top = topRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 90) window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
    });
  };

  return (
    <>
      <div className="menu-tabs" ref={topRef}>
        <div className="menu-tabs__scroll" role="tablist" aria-label={labels.tabs}>
          {sections.map((item) => (
            <button
              className={item.id === activeSection ? "menu-tab menu-tab--active" : "menu-tab"}
              type="button"
              role="tab"
              id={`onglet-${item.id}`}
              aria-selected={item.id === activeSection}
              aria-controls={`menu-panneau-${item.id}`}
              key={item.id}
              onClick={() => choose(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {sections.map((current) => (
        <div
          className="menu-sheet"
          role="tabpanel"
          id={`menu-panneau-${current.id}`}
          aria-labelledby={`onglet-${current.id}`}
          hidden={current.id !== section.id}
          key={current.id}
        >
          <div className="menu-sheet__heading">
            <h2>{current.label}</h2>
            {current.note && <p>{current.note}</p>}
          </div>

          {current.groups.map((group) => (
            <section className={group.photo ? "menu-group menu-group--photo" : "menu-group"} key={group.title}>
              <div className="menu-group__heading">
                <h3>{group.title}</h3>
                {group.note && <p>{group.note}</p>}
              </div>
              <div className="menu-group__body">
                {group.photo && (
                  <div className="menu-group__photo">
                    <Image
                      src={`/menu/${group.photo}.jpg`}
                      alt={group.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 360px"
                    />
                  </div>
                )}
                <div className="menu-list">
                  {group.items.map((item) => (
                    <article className={item.photo ? "menu-item menu-item--photo" : "menu-item"} key={item.name}>
                      {item.photo && (
                        <div className="menu-item__photo">
                          <Image src={`/menu/${item.photo}.jpg`} alt={item.name} fill sizes="(max-width: 700px) 96px, 140px" />
                        </div>
                      )}
                      <div className="menu-item__text">
                        <div className="menu-item__top">
                          <h4>{item.name}</h4>
                          {item.price && <strong>{item.price}</strong>}
                        </div>
                        {item.description && <p>{item.description}</p>}
                        {item.note && <p className="menu-item__note">{item.note}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))}
          <p className="menu-sheet__note">{labels.note}</p>
        </div>
      ))}
    </>
  );
}
