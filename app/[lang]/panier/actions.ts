"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createCheckout, MAX_QUANTITY } from "@/lib/checkout";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { DeliveryAddress } from "@/lib/orders";
import { isUuid } from "@/lib/products";
import { shopHidden } from "@/lib/shop-status";

export type CheckoutFormState = {
  error?: string;
  /** Champ concerné (name, email, phone, line1, city, postalCode), pour l’afficher à côté du champ. */
  field?: string;
};

const messages = {
  fr: {
    soon: "L’épicerie sera bientôt disponible.",
    empty: "Votre panier est vide.",
  },
  en: {
    soon: "The shop will be available soon.",
    empty: "Your cart is empty.",
  },
} satisfies Record<Locale, Record<string, string>>;

const POSTAL_CODE =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/;

function text(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseItems(raw: string) {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is { productId: string; quantity: number } =>
          typeof item === "object" &&
          item !== null &&
          isUuid((item as { productId: unknown }).productId) &&
          Number.isInteger((item as { quantity: unknown }).quantity) &&
          (item as { quantity: number }).quantity > 0 &&
          (item as { quantity: number }).quantity <= MAX_QUANTITY,
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}

async function siteOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const list = await headers();
  const origin = list.get("origin");
  if (origin) return origin;
  const host =
    list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const protocol =
    list.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function startCheckout(
  _previous: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const locale: Locale = text(formData, "lang") === "en" ? "en" : "fr";
  const t = messages[locale];
  const e = getDictionary(locale).cart;
  if (await shopHidden(await db())) return { error: t.soon };
  const items = parseItems(text(formData, "cart", 10_000));
  if (items.length === 0) return { error: t.empty };

  const customer = {
    name: text(formData, "name", 120),
    email: text(formData, "email", 160).toLowerCase(),
    phone: text(formData, "phone", 40),
  };
  if (customer.name.length < 2) return { error: e.errName, field: "name" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return { error: e.errEmail, field: "email" };
  }
  if (customer.phone.replace(/\D/g, "").length < 10) {
    return { error: e.errPhone, field: "phone" };
  }

  const fulfillment =
    text(formData, "fulfillment") === "delivery" ? "delivery" : "pickup";
  let address: DeliveryAddress | null = null;

  if (fulfillment === "delivery") {
    const postalCode = text(formData, "postalCode", 10)
      .toUpperCase()
      .replace(/\s+/g, " ");
    const lat = Number(text(formData, "lat", 30));
    const lng = Number(text(formData, "lng", 30));
    address = {
      line1: text(formData, "line1", 200),
      line2: text(formData, "line2", 100),
      city: text(formData, "city", 100),
      province: text(formData, "province", 30) || "QC",
      postalCode:
        postalCode.length === 6
          ? `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`
          : postalCode,
      ...(text(formData, "placeId", 300)
        ? { placeId: text(formData, "placeId", 300) }
        : {}),
      ...(Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0
        ? { lat, lng }
        : {}),
    };
    if (address.line1.length < 4)
      return { error: e.errAddress, field: "line1" };
    if (address.city.length < 2) return { error: e.errCity, field: "city" };
    if (!POSTAL_CODE.test(address.postalCode)) {
      return { error: e.errPostalCode, field: "postalCode" };
    }
  }

  const result = await createCheckout({
    items,
    customer,
    fulfillment,
    pickupLocation: text(formData, "pickupLocation", 100),
    address,
    note: text(formData, "note", 1000),
    origin: await siteOrigin(),
    locale,
  });

  if (!result.ok) return { error: result.error };
  redirect(result.url);
}
