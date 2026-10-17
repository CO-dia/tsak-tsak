import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { toggleProduct } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/forms";
import { AdminHeader, AdminLoading } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import { formatMoney } from "@/lib/money";
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
  const [products, categories] = await Promise.all([listAllProducts(sql), listCategories(sql)]);
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  if (products.length === 0) {
    return (
      <p className="admin-empty">
        Aucun produit pour l’instant. <Link href="/admin/produits/nouveau">Ajouter un premier produit</Link>.
      </p>
    );
  }

  return (
    <div className="admin-card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th aria-label="Image" />
            <th>Produit</th>
            <th>Catégorie</th>
            <th className="num">Prix</th>
            <th className="num">Stock</th>
            <th>Sur le site</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                {product.imageId ? (
                  // Miniature déjà optimisée côté serveur : pas besoin de next/image ici.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="admin-thumb" src={mediaUrl(product.imageId)} alt="" />
                ) : (
                  <span className="admin-thumb image-input__empty">—</span>
                )}
              </td>
              <td>
                <Link className="row-link" href={`/admin/produits/${product.id}`}>
                  {product.name}
                </Link>
                <br />
                <span className="muted">
                  {product.format || "—"}
                  {product.isTaxable ? " · taxable" : ""}
                </span>
              </td>
              <td>
                {(product.categoryId && categoryNames.get(product.categoryId)) || (
                  <span className="muted">Sans catégorie</span>
                )}
              </td>
              <td className="num">{formatMoney(product.priceCents)}</td>
              <td className="num">
                {product.stock === null ? (
                  <span className="muted">Illimité</span>
                ) : product.stock === 0 ? (
                  <span className="badge badge--warning">Rupture</span>
                ) : (
                  product.stock
                )}
              </td>
              <td>
                <form action={toggleProduct}>
                  <input type="hidden" name="id" value={product.id} />
                  <SubmitButton className="link-button" pendingLabel="…">
                    {product.isActive ? (
                      <span className="badge badge--active">Visible</span>
                    ) : (
                      <span className="badge badge--hidden">Masqué</span>
                    )}
                  </SubmitButton>
                </form>
              </td>
              <td className="num">
                <Link className="link-button" href={`/admin/produits/${product.id}`}>
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="field__hint" style={{ marginTop: 16 }}>
        Cliquez sur « Visible » ou « Masqué » pour afficher ou retirer un produit de l’épicerie.
      </p>
    </div>
  );
}
