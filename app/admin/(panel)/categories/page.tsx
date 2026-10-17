import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { AdminHeader, AdminLoading } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { listCategories } from "@/lib/products";

export const metadata: Metadata = { title: "Catégories" };

export default function CategoriesPage() {
  return (
    <>
      <AdminHeader eyebrow="Épicerie" title="Catégories" />
      <Suspense fallback={<AdminLoading />}>
        <Categories />
      </Suspense>
    </>
  );
}

async function Categories() {
  await requireAdmin();
  const categories = await listCategories(await db());

  return (
    <div className="admin-columns">
      <section className="admin-card">
        <h2>Onglets de l’épicerie</h2>
        <p className="field__hint admin-card__intro">
          Chaque catégorie devient un onglet de l’épicerie (avec « Tous »). Une catégorie sans
          produit visible n’est pas affichée. Le produit choisit sa catégorie dans sa fiche.
        </p>
        {categories.length === 0 ? (
          <p className="admin-empty">Aucune catégorie : l’épicerie affiche tous les produits ensemble.</p>
        ) : (
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id} className="category-row">
                <ActionForm action={saveCategory} className="category-row__form">
                  <input type="hidden" name="id" value={category.id} />
                  <label className="field">
                    <span>Nom</span>
                    <input name="name" type="text" defaultValue={category.name} required maxLength={60} />
                  </label>
                  <label className="field">
                    <span>En anglais</span>
                    <input name="nameEn" type="text" defaultValue={category.nameEn} maxLength={60} lang="en" />
                  </label>
                  <label className="field category-row__position">
                    <span>Ordre</span>
                    <input name="position" type="number" step={1} defaultValue={category.position} />
                  </label>
                  <SubmitButton className="button button--ghost button--small">Enregistrer</SubmitButton>
                </ActionForm>
                <div className="category-row__meta">
                  <Link className="muted" href="/admin/produits">
                    {category.productCount} produit{category.productCount > 1 ? "s" : ""}
                  </Link>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <ConfirmButton
                      className="link-button link-button--danger"
                      message={
                        category.productCount > 0
                          ? `Supprimer « ${category.name} » ? Ses ${category.productCount} produit(s) resteront en vente, sans catégorie.`
                          : `Supprimer « ${category.name} » ?`
                      }
                    >
                      Supprimer
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <h2>Nouvelle catégorie</h2>
        <ActionForm action={saveCategory} className="admin-form admin-form--single" resetOnSuccess>
          <label className="field">
            <span>Nom</span>
            <input name="name" type="text" required maxLength={60} placeholder="Ex. Coffrets cadeaux" />
          </label>
          <label className="field">
            <span>Nom en anglais</span>
            <input name="nameEn" type="text" maxLength={60} placeholder="Ex. Gift boxes" lang="en" />
          </label>
          <label className="field">
            <span>Ordre d’affichage</span>
            <input name="position" type="number" step={1} defaultValue={categories.length} />
            <p className="field__hint">Les plus petits nombres s’affichent en premier.</p>
          </label>
          <div className="form-footer">
            <SubmitButton>Ajouter la catégorie</SubmitButton>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
