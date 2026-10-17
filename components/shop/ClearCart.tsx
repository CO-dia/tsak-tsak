"use client";

import { useEffect } from "react";

import { cart } from "@/components/shop/cart-store";

/** Vide le panier une fois la commande payée. */
export default function ClearCart() {
  useEffect(() => {
    cart.clear();
  }, []);
  return null;
}
