"use client";

import Link from "next/link";
import { useState } from "react";

import { saveProduct } from "@/app/admin/actions";
import { ActionForm, SubmitButton } from "@/components/admin/forms";

export type ProductFormValues = {
  id?: string;
  name: string;
  nameEn: string;
  categoryId: string;
  format: string;
  description: string;
  descriptionEn: string;
  price: string;
  stock: string;
  position: string;
  isActive: boolean;
  isTaxable: boolean;
  imageUrl: string | null;
};

export default function ProductForm({
  product,
  categories,
}: {
  product: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const [preview, setPreview] = useState<string | null>(product.imageUrl);

  return (
    <ActionForm action={saveProduct} className="admin-card admin-form">
      {product.id && <input type="hidden" name="id" value={product.id} />}

      <label className="field">
        <span>Nom du produit</span>
        <input name="name" type="text" defaultValue={product.name} required maxLength={120} />
      </label>
      <label className="field">
        <span>Nom en anglais</span>
        <input name="nameEn" type="text" defaultValue={product.nameEn} maxLength={120} lang="en" />
        <p className="field__hint">Version anglaise du site. Laisser vide pour garder le nom français.</p>
      </label>
      <label className="field">
        <span>Description</span>
        <textarea name="description" defaultValue={product.description} rows={4} maxLength={1000} />
      </label>
      <label className="field">
        <span>Description en anglais</span>
        <textarea
          name="descriptionEn"
          defaultValue={product.descriptionEn}
          rows={4}
          maxLength={1000}
          lang="en"
        />
      </label>
      <label className="field">
        <span>Prix ($)</span>
        <input name="price" type="text" inputMode="decimal" defaultValue={product.price} placeholder="12,50" required />
      </label>
      <label className="field">
        <span>Format</span>
        <input name="format" type="text" defaultValue={product.format} placeholder="250 ml, 400 g, coffret…" maxLength={60} />
      </label>
      <label className="field">
        <span>Catégorie</span>
        <select name="categoryId" defaultValue={product.categoryId}>
          <option value="">Sans catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="field__hint">
          Onglet de l’épicerie où le produit apparaît. <Link href="/admin/categories">Gérer les catégories</Link>
        </p>
      </label>
      <label className="field">
        <span>Stock</span>
        <input name="stock" type="number" min={0} step={1} defaultValue={product.stock} placeholder="Illimité" />
        <p className="field__hint">Laisser vide si vous ne suivez pas le stock de ce produit.</p>
      </label>

      <div className="field field--wide">
        <span className="field-label">Photo</span>
        <div className="image-input">
          {preview ? (
            // Aperçu local du fichier choisi (URL blob) : next/image n’est pas adapté ici.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="image-input__preview" src={preview} alt="" />
          ) : (
            <span className="image-input__preview image-input__empty">Aucune photo</span>
          )}
          <div className="field">
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : product.imageUrl);
              }}
            />
            <p className="field__hint">
              JPEG, PNG ou WebP, 10 Mo au plus. Format portrait conseillé. L’image est recadrée et
              optimisée automatiquement.
            </p>
          </div>
        </div>
      </div>

      <label className="field">
        <span>Ordre d’affichage</span>
        <input name="position" type="number" step={1} defaultValue={product.position} />
        <p className="field__hint">Les plus petits nombres s’affichent en premier.</p>
      </label>

      <label className="toggle">
        <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
        <span>
          <strong>Visible sur le site</strong>
          <small>Décochez pour retirer temporairement le produit de l’épicerie.</small>
        </span>
      </label>
      <label className="toggle">
        <input type="checkbox" name="isTaxable" defaultChecked={product.isTaxable} />
        <span>
          <strong>Produit taxable (TPS et TVQ)</strong>
          <small>Utilisé seulement si la perception des taxes est activée dans les paramètres.</small>
        </span>
      </label>

      <div className="form-footer">
        <SubmitButton>{product.id ? "Enregistrer les modifications" : "Ajouter le produit"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
