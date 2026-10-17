import { notFound } from "next/navigation";

// Toute adresse inconnue sous /admin affiche la page 404 de l’admin (avec le menu).
export default function UnknownAdminPage() {
  notFound();
}
