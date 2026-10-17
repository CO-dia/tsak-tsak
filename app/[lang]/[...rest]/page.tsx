import { notFound } from "next/navigation";

/** Toute adresse inconnue du site affiche la page 404 avec l’en-tête et le pied de page. */
export default function UnknownPage() {
  notFound();
}
