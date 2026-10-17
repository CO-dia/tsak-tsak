"use client";

import { useEffect, useState } from "react";

import { cart, useCartLines } from "@/components/shop/cart-store";

type Props = {
  product: {
    id: string;
    name: string;
    priceCents: number;
    format: string;
    imageUrl: string | null;
    stock: number | null;
  };
  labels: { add: string; added: string; maxInCart: string };
  /** Raison pour laquelle l’ajout est impossible (boutique fermée, rupture…). */
  disabledLabel?: string;
};

export default function AddToCartButton({ product, labels, disabledLabel }: Props) {
  const [added, setAdded] = useState(false);
  const inCart = useCartLines().find((line) => line.productId === product.id)?.quantity ?? 0;
  const soldOut = product.stock !== null && inCart >= product.stock;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  if (disabledLabel || soldOut) {
    return (
      <button className="button button--dark button--full" type="button" disabled>
        {disabledLabel ?? labels.maxInCart}
      </button>
    );
  }

  return (
    <button
      className="button button--dark button--full"
      type="button"
      aria-live="polite"
      onClick={() => {
        cart.add({
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          format: product.format,
          imageUrl: product.imageUrl,
        });
        setAdded(true);
      }}
    >
      {added ? labels.added : labels.add} <span aria-hidden="true">{added ? "✓" : "+"}</span>
    </button>
  );
}
