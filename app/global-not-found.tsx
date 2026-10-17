import type { Metadata } from "next";
import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { fontVariables } from "@/lib/fonts";
import { href } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tsaktsak.com"),
  title: "Page introuvable · Page not found — Tsak Tsak",
  robots: { index: false },
};

// Adresses qui ne correspondent à aucune route (ex. fichier absent) : page autonome et bilingue.
export default function GlobalNotFound() {
  const fr = getDictionary("fr").notFound;
  const en = getDictionary("en").notFound;

  return (
    <html lang="fr-CA" className={fontVariables}>
      <body>
        <main className="not-found not-found--global">
          <p className="eyebrow">
            {fr.eyebrow} · {en.eyebrow}
          </p>
          <h1>{fr.heading}</h1>
          <p className="not-found__en" lang="en">
            {en.heading}
          </p>
          <div className="hero__buttons">
            <Link className="button button--dark" href={href("fr", "home")}>
              {fr.back}
            </Link>
            <Link className="button button--ghost" href={href("en", "home")} lang="en">
              {en.back}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
