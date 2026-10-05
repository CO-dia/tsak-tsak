"use client";

import { useEffect, useState } from "react";
import { RESERVATION_URL } from "@/lib/links";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`} id="top">
      <div className="wrap nav">
        <a href="#accueil" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Tsak Tsak — Créateur de saveurs" />
        </a>
        <button className="burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`menu${open ? " open" : ""}`}>
          <li><a href="#cuisine" onClick={close}>Cuisine</a></li>
          <li><a href="#adresses" onClick={close}>Adresses</a></li>
          <li><a href="#traiteur" onClick={close}>Traiteur</a></li>
          <li>
            <a className="btn" href={RESERVATION_URL} target="_blank" rel="noopener" onClick={close}>
              Réserver
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
