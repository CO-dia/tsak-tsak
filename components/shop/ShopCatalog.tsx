"use client";

import Image from "next/image";
import { useState } from "react";

import AddToCartButton from "@/components/shop/AddToCartButton";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";

export type CatalogProduct = {
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
};

export type CatalogCategory = { id: string; slug: string; name: string };

type Labels = Pick<
  Dictionary["shop"],
  "all" | "filterLabel" | "add" | "added" | "soldOut" | "comingSoon" | "maxInCart" | "empty"
> & { countSingular: string; countPlural: string };

/**
 * Onglets de catégories + grille de produits. Le filtre se fait dans le navigateur (instantané)
 * et l’adresse est mise à jour (?categorie=…) pour pouvoir partager le lien.
 */
export default function ShopCatalog({
  lang,
  products,
  categories,
  initialCategory,
  shopOpen,
  labels: t,
}: {
  lang: Locale;
  products: CatalogProduct[];
  categories: CatalogCategory[];
  initialCategory: string | null;
  shopOpen: boolean;
  labels: Labels;
}) {
  const visibleCategories = categories.filter((category) =>
    products.some((product) => product.categoryId === category.id),
  );
  const [active, setActive] = useState<string | null>(
    visibleCategories.some((category) => category.slug === initialCategory) ? initialCategory : null,
  );
  const activeCategory = visibleCategories.find((category) => category.slug === active);
  const shown = activeCategory
    ? products.filter((product) => product.categoryId === activeCategory.id)
    : products;

  function choose(slug: string | null) {
    setActive(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("categorie", slug);
    else url.searchParams.delete("categorie");
    window.history.replaceState(null, "", url);
  }

  if (products.length === 0) {
    return <p className="shop-status">{t.empty}</p>;
  }

  return (
    <>
      <div className="shop-filters">
        {visibleCategories.length > 1 && (
          <div className="shop-filters__tabs" role="group" aria-label={t.filterLabel}>
            <button type="button" aria-pressed={active === null} onClick={() => choose(null)}>
              {t.all}
            </button>
            {visibleCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                aria-pressed={active === category.slug}
                onClick={() => choose(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
        <p className="shop-filters__count" aria-live="polite">
          {shown.length} {shown.length > 1 ? t.countPlural : t.countSingular}
        </p>
      </div>

      <div className="product-grid">
        {shown.map((product, index) => {
          const soldOut = product.stock === 0;
          return (
            <article className="product-card" key={product.id}>
              <div className="product-card__image">
                {product.imageUrl && product.imageWidth && product.imageHeight ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={product.imageWidth}
                    height={product.imageHeight}
                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="product-card__placeholder" aria-hidden="true" />
                )}
                <span className="product-card__index">{String(index + 1).padStart(2, "0")}</span>
                {soldOut && <span className="product-card__badge">{t.soldOut}</span>}
              </div>
              <div className="product-card__body">
                <p className="product-card__price">
                  {formatMoney(product.priceCents, lang)}
                  {product.format ? ` · ${product.format}` : ""}
                </p>
                <h2>{product.name}</h2>
                <p className="product-card__description">{product.description}</p>
                <AddToCartButton
                  product={product}
                  labels={{ add: t.add, added: t.added, maxInCart: t.maxInCart }}
                  disabledLabel={!shopOpen ? t.comingSoon : soldOut ? t.soldOut : undefined}
                />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
