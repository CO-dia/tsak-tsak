import "server-only";

import type { Queryable } from "@/lib/db";

export type ShopSettings = {
  /** L’épicerie et le panier sont affichés ; sinon « bientôt disponible » à leur place. */
  shopVisible: boolean;
  /** La boutique accepte les commandes. */
  shopOpen: boolean;
  closedMessage: string;
  closedMessageEn: string;
  pickupEnabled: boolean;
  pickupInstructions: string;
  pickupInstructionsEn: string;
  deliveryEnabled: boolean;
  /** Frais de livraison fixes, en cents (0 = sans frais). */
  deliveryFeeCents: number;
  deliveryInstructions: string;
  deliveryInstructionsEn: string;
  /** Percevoir la TPS et la TVQ sur les produits marqués « taxables ». */
  taxesEnabled: boolean;
  gstNumber: string;
  qstNumber: string;
  /** Adresse qui reçoit les avis de nouvelles commandes. */
  notificationEmail: string;
};

export const defaultSettings: ShopSettings = {
  shopVisible: true,
  shopOpen: true,
  closedMessage: "La boutique en ligne est fermée pour le moment. Revenez bientôt!",
  closedMessageEn: "Our online shop is closed for the moment. Come back soon!",
  pickupEnabled: true,
  pickupInstructions:
    "Nous vous écrirons dès que votre commande sera prête. Présentez-vous au comptoir avec votre numéro de commande.",
  pickupInstructionsEn:
    "We’ll email you as soon as your order is ready. Come to the counter with your order number.",
  deliveryEnabled: true,
  deliveryFeeCents: 0,
  deliveryInstructions:
    "La livraison est organisée par notre équipe dans le Grand Montréal. Nous vous contacterons pour convenir du moment.",
  deliveryInstructionsEn:
    "Delivery is arranged by our team in Greater Montréal. We’ll contact you to set a time.",
  taxesEnabled: false,
  gstNumber: "",
  qstNumber: "",
  notificationEmail: "",
};

export async function getSettings(sql: Queryable): Promise<ShopSettings> {
  const [row] = await sql<{ value: Partial<ShopSettings> }[]>`
    select value from settings where key = 'shop'
  `;
  return { ...defaultSettings, ...(row?.value ?? {}) };
}

export async function saveSettings(sql: Queryable, settings: ShopSettings) {
  await sql`
    insert into settings (key, value, updated_at) values ('shop', ${sql.json(settings)}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

/** Textes destinés aux clients, dans leur langue (français si la traduction est vide). */
export function localizedSettings(settings: ShopSettings, lang: "fr" | "en") {
  const pick = (fr: string, en: string) => (lang === "en" && en.trim() ? en : fr);
  return {
    closedMessage: pick(settings.closedMessage, settings.closedMessageEn),
    pickupInstructions: pick(settings.pickupInstructions, settings.pickupInstructionsEn),
    deliveryInstructions: pick(settings.deliveryInstructions, settings.deliveryInstructionsEn),
  };
}
