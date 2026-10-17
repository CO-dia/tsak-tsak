import "server-only";

import Stripe from "stripe";

import type { Queryable } from "@/lib/db";

let client: Stripe | undefined;

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY n’est pas configurée.");
  if (!client) {
    client = new Stripe(key, {
      appInfo: { name: "Tsak Tsak", url: "https://tsaktsak.com" },
      maxNetworkRetries: 2,
      // Permet de pointer vers stripe-mock en développement (STRIPE_API_HOST=localhost, etc.).
      ...(process.env.STRIPE_API_HOST
        ? {
            host: process.env.STRIPE_API_HOST,
            port: process.env.STRIPE_API_PORT ?? "12111",
            protocol: (process.env.STRIPE_API_PROTOCOL as "http" | "https" | undefined) ?? "http",
          }
        : {}),
    });
  }
  return client;
}

export function stripeMode(): "live" | "test" {
  return /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "") ? "live" : "test";
}

/** Lien vers un paiement dans le tableau de bord Stripe. */
export function stripePaymentUrl(paymentIntentId: string) {
  const prefix = stripeMode() === "test" ? "test/" : "";
  return `https://dashboard.stripe.com/${prefix}payments/${paymentIntentId}`;
}

/**
 * Taux de taxes Stripe (TPS 5 % et TVQ 9,975 %), créés une seule fois par mode (test / réel)
 * puis mémorisés dans la table settings.
 */
export async function ensureTaxRates(sql: Queryable): Promise<{ gst: string; qst: string }> {
  const key = `stripe_tax_rates_${stripeMode()}`;
  const [row] = await sql<{ value: { gst: string; qst: string } }[]>`
    select value from settings where key = ${key}
  `;
  if (row) return row.value;

  const stripe = getStripe();
  const [gst, qst] = await Promise.all([
    stripe.taxRates.create({
      display_name: "TPS",
      description: "Taxe sur les produits et services",
      percentage: 5,
      inclusive: false,
      country: "CA",
      jurisdiction: "CA",
      tax_type: "gst",
      metadata: { app: "tsaktsak" },
    }),
    stripe.taxRates.create({
      display_name: "TVQ",
      description: "Taxe de vente du Québec",
      percentage: 9.975,
      inclusive: false,
      country: "CA",
      state: "QC",
      jurisdiction: "QC",
      tax_type: "qst",
      metadata: { app: "tsaktsak" },
    }),
  ]);

  const value = { gst: gst.id, qst: qst.id };
  await sql`
    insert into settings (key, value) values (${key}, ${sql.json(value)})
    on conflict (key) do nothing
  `;
  return value;
}
