"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/parametres", label: "Paramètres" },
  { href: "/admin/compte", label: "Compte" },
];

export default function AdminNav() {
  return <NavLinks pathname={usePathname()} />;
}

/** Version sans lien actif, affichée pendant le prérendu (le chemin n’est connu qu’à la requête). */
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav className="admin-nav" aria-label="Administration">
      {links.map((link) => {
        const active =
          pathname !== null &&
          (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
