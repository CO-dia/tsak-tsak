import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/app/admin/actions";
import AdminNav, { NavLinks } from "@/components/admin/AdminNav";
import { Logo } from "@/components/ui";

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <Link className="admin__brand" href="/admin">
          <Logo light />
          <p>Administration</p>
        </Link>
        <Suspense fallback={<NavLinks pathname={null} />}>
          <AdminNav />
        </Suspense>
        <div className="admin__sidebar-footer">
          <Link href="/" target="_blank">
            Voir le site ↗
          </Link>
          <form action={logout}>
            <button type="submit">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <main className="admin__main">{children}</main>
    </div>
  );
}
