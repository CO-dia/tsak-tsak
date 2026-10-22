"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState, type DragEvent } from "react";

import { reorderProducts, toggleProduct } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/forms";
import { formatMoney } from "@/lib/money";

export type ProductRow = {
  id: string;
  name: string;
  format: string;
  isTaxable: boolean;
  isActive: boolean;
  priceCents: number;
  stock: number | null;
  categoryName: string | null;
  imageSrc: string | null;
};

/** Tableau des produits, réordonnable par glisser-déposer (ou avec les flèches). */
export default function ProductTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const byId = new Map(products.map((product) => [product.id, product]));
  const ids = order
    ? [
        ...order.filter((id) => byId.has(id)),
        ...products.map((p) => p.id).filter((id) => !order.includes(id)),
      ]
    : products.map((product) => product.id);

  function move(id: string, target: number) {
    const from = ids.indexOf(id);
    if (from === -1 || target < 0 || target >= ids.length || target === from)
      return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(target, 0, id);
    setOrder(next);
    startTransition(() => reorderProducts(next));
  }

  function onDragStart(event: DragEvent<HTMLElement>, id: string) {
    const row = event.currentTarget.closest("tr");
    if (row) event.dataTransfer.setDragImage(row, 20, 20);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDragging(id);
  }

  return (
    <div className="admin-card admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th aria-label="Ordre" />
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
          {ids.map((id, index) => {
            const product = byId.get(id)!;
            return (
              <tr
                key={id}
                onClick={(event) => {
                  if (
                    (event.target as HTMLElement).closest(
                      "a, button, input, label, form, .row-handle",
                    )
                  )
                    return;
                  router.push(`/admin/produits/${id}`);
                }}
                className={`is-clickable ${dragging === id ? "is-dragging" : ""}${over === id && dragging !== id ? " is-over" : ""}`}
                onDragOver={(event) => {
                  if (!dragging) return;
                  event.preventDefault();
                  setOver(id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragging && dragging !== id) move(dragging, index);
                  setDragging(null);
                  setOver(null);
                }}
              >
                <td>
                  <div className="row-handle">
                    <span
                      className="drag-handle"
                      draggable
                      role="presentation"
                      title="Glisser pour changer l’ordre"
                      onDragStart={(event) => onDragStart(event, id)}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                      }}
                    >
                      ⠿
                    </span>
                    <button
                      type="button"
                      className="link-button"
                      aria-label={`Monter « ${product.name} »`}
                      disabled={index === 0}
                      onClick={() => move(id, index - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      aria-label={`Descendre « ${product.name} »`}
                      disabled={index === ids.length - 1}
                      onClick={() => move(id, index + 1)}
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td>
                  {product.imageSrc ? (
                    // Miniature déjà optimisée côté serveur : pas besoin de next/image ici.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="admin-thumb"
                      src={product.imageSrc}
                      alt=""
                    />
                  ) : (
                    <span className="admin-thumb image-input__empty">—</span>
                  )}
                </td>
                <td>
                  <Link
                    className="row-link"
                    href={`/admin/produits/${product.id}`}
                  >
                    {product.name}
                  </Link>
                  <br />
                  <span className="muted">
                    {product.format || "—"}
                    {product.isTaxable ? " · taxable" : ""}
                  </span>
                </td>
                <td>
                  {product.categoryName ?? (
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
                  <Link
                    className="link-button"
                    href={`/admin/produits/${product.id}`}
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="field__hint" style={{ marginTop: 16 }}>
        Glissez un produit par la poignée ⠿ pour changer son ordre dans
        l’épicerie. Cliquez sur « Visible » ou « Masqué » pour afficher ou
        retirer un produit.
      </p>
    </div>
  );
}
