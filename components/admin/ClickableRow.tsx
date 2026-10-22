"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** Ligne de tableau cliquable en entier. Les liens et boutons qu’elle contient gardent leur action. */
export default function ClickableRow({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      className="is-clickable"
      onClick={(event) => {
        if (
          (event.target as HTMLElement).closest(
            "a, button, input, select, textarea, label, form",
          )
        )
          return;
        if (window.getSelection()?.toString()) return;
        router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
