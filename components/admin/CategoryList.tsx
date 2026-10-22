"use client";

import { startTransition, useState, type DragEvent } from "react";

import {
  deleteCategory,
  reorderCategories,
  saveCategory,
} from "@/app/admin/actions";
import {
  ActionForm,
  ConfirmButton,
  SubmitButton,
} from "@/components/admin/forms";
import type { listCategories } from "@/lib/products";

type Category = Awaited<ReturnType<typeof listCategories>>[number];

/** Liste des catégories, réordonnable par glisser-déposer (ou avec les flèches). */
export default function CategoryList({
  categories,
}: {
  categories: Category[];
}) {
  // Ordre local (ids) pour réagir tout de suite ; les données restent celles du serveur.
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const byId = new Map(categories.map((category) => [category.id, category]));
  const ids = order
    ? [
        ...order.filter((id) => byId.has(id)),
        ...categories.map((c) => c.id).filter((id) => !order.includes(id)),
      ]
    : categories.map((category) => category.id);

  function commit(next: string[]) {
    setOrder(next);
    startTransition(() => reorderCategories(next));
  }

  function move(id: string, target: number) {
    const from = ids.indexOf(id);
    if (from === -1 || target < 0 || target >= ids.length || target === from)
      return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(target, 0, id);
    commit(next);
  }

  function onDragStart(event: DragEvent<HTMLElement>, id: string) {
    const row = event.currentTarget.closest("li");
    if (row) event.dataTransfer.setDragImage(row, 20, 20);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDragging(id);
  }

  function onDrop(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    if (dragging && dragging !== targetId)
      move(dragging, ids.indexOf(targetId));
    setDragging(null);
    setOver(null);
  }

  return (
    <ul className="category-list">
      {ids.map((id, index) => {
        const category = byId.get(id)!;
        return (
          <li
            key={id}
            className={`category-row${dragging === id ? " is-dragging" : ""}${over === id && dragging !== id ? " is-over" : ""}`}
            onDragOver={(event) => {
              if (!dragging) return;
              event.preventDefault();
              setOver(id);
            }}
            onDrop={(event) => onDrop(event, id)}
          >
            <div className="category-row__handle">
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
                aria-label={`Monter « ${category.name} »`}
                disabled={index === 0}
                onClick={() => move(id, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="link-button"
                aria-label={`Descendre « ${category.name} »`}
                disabled={index === ids.length - 1}
                onClick={() => move(id, index + 1)}
              >
                ↓
              </button>
            </div>
            <div className="category-row__body">
              <ActionForm action={saveCategory} className="category-row__form">
                <input type="hidden" name="id" value={category.id} />
                <label className="field">
                  <span>Nom</span>
                  <input
                    name="name"
                    type="text"
                    defaultValue={category.name}
                    required
                    maxLength={60}
                  />
                </label>
                <label className="field">
                  <span>En anglais</span>
                  <input
                    name="nameEn"
                    type="text"
                    defaultValue={category.nameEn}
                    maxLength={60}
                    lang="en"
                  />
                </label>
                <SubmitButton className="button button--ghost button--small">
                  Enregistrer
                </SubmitButton>
              </ActionForm>
              <div className="category-row__meta">
                <span className="muted">
                  {category.productCount} produit
                  {category.productCount > 1 ? "s" : ""}
                </span>
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
