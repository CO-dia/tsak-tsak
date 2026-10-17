import "server-only";

import type { Queryable } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import { mediaUrl } from "@/lib/media";

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  format: string;
  description: string;
  descriptionEn: string;
  categoryId: string | null;
  priceCents: number;
  imageId: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  /** null = stock illimité */
  stock: number | null;
  isActive: boolean;
  isTaxable: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Données d’un produit sûres à envoyer au navigateur. */
export type PublicProduct = {
  id: string;
  categoryId: string | null;
  name: string;
  format: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  stock: number | null;
  isTaxable: boolean;
};

const productColumns = (sql: Queryable) => sql`
  p.id, p.slug, p.name, p.name_en, p.format, p.description, p.description_en, p.category_id,
  p.price_cents, p.image_id,
  m.width as image_width, m.height as image_height,
  p.stock, p.is_active, p.is_taxable, p.position, p.created_at, p.updated_at
`;

/** Nom d’un produit dans la langue demandée (français si la traduction est vide). */
export function productName(product: { name: string; nameEn: string }, lang: Locale) {
  return lang === "en" && product.nameEn ? product.nameEn : product.name;
}

export function toPublicProduct(product: Product, lang: Locale = "fr"): PublicProduct {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: productName(product, lang),
    format: product.format,
    description:
      lang === "en" && product.descriptionEn ? product.descriptionEn : product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageId ? mediaUrl(product.imageId) : null,
    imageWidth: product.imageWidth,
    imageHeight: product.imageHeight,
    stock: product.stock,
    isTaxable: product.isTaxable,
  };
}

/** Produits visibles sur le site, dans l’ordre d’affichage. */
export async function listActiveProducts(sql: Queryable) {
  return sql<Product[]>`
    select ${productColumns(sql)}
    from products p left join media m on m.id = p.image_id
    where p.is_active and p.archived_at is null
    order by p.position, p.created_at
  `;
}

/** Tous les produits (non archivés) pour l’admin. */
export async function listAllProducts(sql: Queryable) {
  return sql<Product[]>`
    select ${productColumns(sql)}
    from products p left join media m on m.id = p.image_id
    where p.archived_at is null
    order by p.position, p.created_at
  `;
}

export async function getProduct(sql: Queryable, id: string) {
  const [product] = await sql<Product[]>`
    select ${productColumns(sql)}
    from products p left join media m on m.id = p.image_id
    where p.id = ${id} and p.archived_at is null
  `;
  return product ?? null;
}

export async function getProductsByIds(sql: Queryable, ids: string[]) {
  if (ids.length === 0) return [];
  return sql<Product[]>`
    select ${productColumns(sql)}
    from products p left join media m on m.id = p.image_id
    where p.id in ${sql(ids)} and p.archived_at is null
  `;
}

export function slugify(input: string) {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "produit"
  );
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

// ---------- Catégories ----------

export type Category = {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  position: number;
  productCount: number;
};

export async function listCategories(sql: Queryable) {
  return sql<Category[]>`
    select c.id, c.name, c.name_en, c.slug, c.position,
      (select count(*)::int from products p where p.category_id = c.id and p.archived_at is null)
        as product_count
    from categories c
    order by c.position, c.name
  `;
}

export function categoryName(category: { name: string; nameEn: string }, lang: Locale) {
  return lang === "en" && category.nameEn ? category.nameEn : category.name;
}
