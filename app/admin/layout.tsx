import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/lib/fonts";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tsaktsak.com"),
  title: {
    default: "Administration",
    template: "%s — Admin Tsak Tsak",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#3b2a20",
};

// Layout racine de l’admin (toujours en français), séparé de celui du site public (app/[lang]).
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr-CA" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
