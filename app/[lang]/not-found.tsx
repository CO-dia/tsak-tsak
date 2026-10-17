import Link from "next/link";

import { Arrow } from "@/components/ui";
import { getDictionary } from "@/lib/dictionaries";
import { href } from "@/lib/i18n";

// Le segment [lang] ne transmet pas ses paramètres à not-found : le texte est bilingue.
export default function NotFound() {
  const fr = getDictionary("fr").notFound;
  const en = getDictionary("en").notFound;

  return (
    <section className="not-found">
      <p className="eyebrow">
        {fr.eyebrow} · {en.eyebrow}
      </p>
      <h1>{fr.heading}</h1>
      <p className="not-found__en" lang="en">
        {en.heading}
      </p>
      <div className="hero__buttons">
        <Link className="button button--dark" href={href("fr", "home")}>
          {fr.back} <Arrow />
        </Link>
        <Link className="button button--ghost" href={href("en", "home")} lang="en">
          {en.back} <Arrow />
        </Link>
      </div>
    </section>
  );
}
