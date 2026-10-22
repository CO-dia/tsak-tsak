import { redirect } from "next/navigation";

// Les catégories se gèrent désormais depuis la page Produits.
export default function CategoriesPage() {
  redirect("/admin/produits#categories");
}
