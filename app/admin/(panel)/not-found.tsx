import Link from "next/link";

import { AdminHeader } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <>
      <AdminHeader eyebrow="Erreur 404" title="Introuvable" />
      <p className="admin-empty">
        Cet élément n’existe pas ou a été supprimé. <Link href="/admin">Retour au tableau de bord</Link>
      </p>
    </>
  );
}
