"use client";

import { useSyncExternalStore } from "react";

/** Ligne du panier gardée dans le navigateur. Les prix affichés sont revalidés par le serveur. */
export type CartLine = {
  productId: string;
  quantity: number;
  name: string;
  priceCents: number;
  format: string;
  imageUrl: string | null;
};

const STORAGE_KEY = "tsaktsak-panier-v1";
const MAX_QUANTITY = 50;
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isLine(value: unknown): value is CartLine {
  const line = value as CartLine;
  return (
    typeof line === "object" &&
    line !== null &&
    typeof line.productId === "string" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    typeof line.name === "string" &&
    typeof line.priceCents === "number"
  );
}

function read() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    lines = Array.isArray(parsed) ? parsed.filter(isLine) : EMPTY;
  } catch {
    lines = EMPTY;
  }
  loaded = true;
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Stockage indisponible (navigation privée) : le panier reste en mémoire.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      read();
      listeners.forEach((current) => current());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (!loaded) read();
  return lines;
}

function getServerSnapshot() {
  return EMPTY;
}

export const cart = {
  add(product: Omit<CartLine, "quantity">, quantity = 1) {
    const current = getSnapshot();
    const existing = current.find((line) => line.productId === product.productId);
    commit(
      existing
        ? current.map((line) =>
            line.productId === product.productId
              ? { ...line, ...product, quantity: Math.min(line.quantity + quantity, MAX_QUANTITY) }
              : line,
          )
        : [...current, { ...product, quantity: Math.min(quantity, MAX_QUANTITY) }],
    );
  },
  setQuantity(productId: string, quantity: number) {
    const current = getSnapshot();
    commit(
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) }
              : line,
          ),
    );
  },
  remove(productId: string) {
    commit(getSnapshot().filter((line) => line.productId !== productId));
  },
  clear() {
    commit(EMPTY);
  },
};

export function useCartLines() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount() {
  return useCartLines().reduce((sum, line) => sum + line.quantity, 0);
}
