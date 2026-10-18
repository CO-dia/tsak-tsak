import Image from "next/image";
import type { ReactNode } from "react";

/** Logo officiel : version crème sur les fonds foncés (`light`), brune sur les fonds clairs. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Image
      className="logo"
      src={light ? "/brand/logo-light.png" : "/brand/logo-dark.png"}
      alt="Tsak Tsak — Créateur de saveurs, depuis 2009"
      width={480}
      height={366}
      sizes="150px"
    />
  );
}

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function PageHero({
  index,
  eyebrow,
  title,
  description,
  actions,
  compact,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** Boutons affichés à la place de la description. */
  actions?: ReactNode;
  /** Hero réduit (pages utilitaires comme le panier). */
  compact?: boolean;
}) {
  return (
    <section className={compact ? "page-hero page-hero--compact" : "page-hero"}>
      <p className="page-hero__index">{index}</p>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {actions ? (
        <div className="page-hero__actions">{actions}</div>
      ) : (
        <p className="page-hero__description">{description}</p>
      )}
    </section>
  );
}
