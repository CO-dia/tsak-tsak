"use client";

import { useState } from "react";

type Section = {
  id: string;
  number: string;
  label: string;
  note: string;
  groups: {
    title: string;
    note: string;
    items: { name: string; description: string; note: string; price: string }[];
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
  const section = sections.find((item) => item.id === activeSection) ?? sections[0];

  return (
    <>
      <div className="menu-tabs" role="tablist" aria-label={labels.tabs}>
        {sections.map((item) => (
          <button
            className={item.id === activeSection ? "menu-tab menu-tab--active" : "menu-tab"}
            type="button"
            role="tab"
            id={`onglet-${item.id}`}
            aria-selected={item.id === activeSection}
            aria-controls="menu-panneau"
            key={item.id}
            onClick={() => setActiveSection(item.id)}
          >
            <span>{item.number}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="menu-sheet" role="tabpanel" id="menu-panneau" aria-labelledby={`onglet-${section.id}`}>
        <div className="menu-sheet__heading">
          <p>
            {section.number} / {labels.alaCarte}
          </p>
          <h2>{section.label}</h2>
          {section.note && <span>{section.note}</span>}
        </div>
        <div className="menu-groups">
          {section.groups.map((group) => (
            <section className="menu-group" key={group.title}>
              <div className="menu-group__heading">
                <h3>{group.title}</h3>
                {group.note && <p>{group.note}</p>}
              </div>
              <div className="menu-list">
                {group.items.map((item) => (
                  <article className="menu-item" key={item.name}>
                    <div>
                      <h4>{item.name}</h4>
                      {item.description && <p>{item.description}</p>}
                      {item.note && <p className="menu-item__note">{item.note}</p>}
                    </div>
                    {item.price && <strong>{item.price}</strong>}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="menu-sheet__note">{labels.note}</p>
      </div>
    </>
  );
}
