import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import CategoryManager from "@/components/admin/CategoryManager";
import ProductTable from "@/components/admin/ProductTable";
import { AdminHeader, AdminLoading } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import { listAllProducts, listCategories } from "@/lib/products";

export const metadata: Metadata = { title: "Produits" };

export default function ProductsPage() {
  return (
    <>
      <AdminHeader
        eyebrow="Épicerie"
        title="Produits"
        actions={
          <Link className="button button--dark" href="/admin/produits/nouveau">
            Nouveau produit <span aria-hidden="true">+</span>
          </Link>
        }
      />
      <Suspense fallback={<AdminLoading />}>
        <Products />
      </Suspense>
    </>
  );
}

async function Products() {
  await requireAdmin();
  const sql = await db();
  const [products, categories] = await Promise.all([
    listAllProducts(sql),
    listCategories(sql),
  ]);
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <>
      {products.length === 0 ? (
        <p className="admin-empty">
          Aucun produit pour l’instant.{" "}
          <Link href="/admin/produits/nouveau">Ajouter un premier produit</Link>
          .
        </p>
      ) : (
        <ProductTable
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            format: product.format,
            isTaxable: product.isTaxable,
            isActive: product.isActive,
            priceCents: product.priceCents,
            stock: product.stock,
            categoryName:
              (product.categoryId && categoryNames.get(product.categoryId)) ||
              null,
            imageSrc: product.imageId ? mediaUrl(product.imageId) : null,
          }))}
        />
      )}
      <CategoryManager categories={categories} />
    </>
  );
}
