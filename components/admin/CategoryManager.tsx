import { saveCategory } from "@/app/admin/actions";
import CategoryList from "@/components/admin/CategoryList";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import type { listCategories } from "@/lib/products";

type Category = Awaited<ReturnType<typeof listCategories>>[number];

export default function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section id="categories" className="admin-section">
      <h2 className="admin-section__title">Catégories</h2>
      <div className="admin-columns">
        <section className="admin-card">
          <h2>Onglets de l’épicerie</h2>
          <p className="field__hint admin-card__intro">
            Chaque catégorie devient un onglet de l’épicerie (avec « Tous »).
            Une catégorie sans produit visible n’est pas affichée. Le produit
            choisit sa catégorie dans sa fiche.
          </p>
          {categories.length === 0 ? (
            <p className="admin-empty">
              Aucune catégorie : l’épicerie affiche tous les produits ensemble.
            </p>
          ) : (
            <CategoryList categories={categories} />
          )}
        </section>

        <section className="admin-card">
          <h2>Nouvelle catégorie</h2>
          <ActionForm
            action={saveCategory}
            className="admin-form admin-form--single"
            resetOnSuccess
          >
            <label className="field">
              <span>Nom</span>
              <input
                name="name"
                type="text"
                required
                maxLength={60}
                placeholder="Ex. Coffrets cadeaux"
              />
            </label>
            <label className="field">
              <span>Nom en anglais</span>
              <input
                name="nameEn"
                type="text"
                maxLength={60}
                placeholder="Ex. Gift boxes"
                lang="en"
              />
            </label>
            <div className="form-footer">
              <SubmitButton>Ajouter la catégorie</SubmitButton>
            </div>
          </ActionForm>
        </section>
      </div>
    </section>
  );
}
