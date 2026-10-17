import "server-only";

import type Stripe from "stripe";

import { addresses } from "@/lib/content";
import { db } from "@/lib/db";
import { routes, type Locale } from "@/lib/i18n";
import { mediaUrl } from "@/lib/media";
import { estimateTaxes } from "@/lib/money";
import type { DeliveryAddress } from "@/lib/orders";
import { getProductsByIds, productName } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { ensureTaxRates, getStripe, stripeConfigured } from "@/lib/stripe";

export const MAX_QUANTITY = 50;

export const pickupLocations = addresses.map((address) => address.name);

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  customer: { name: string; email: string; phone: string };
  fulfillment: "pickup" | "delivery";
  pickupLocation: string;
  address: DeliveryAddress | null;
  note: string;
  locale: Locale;
  /** Adresse publique du site, pour les URL de retour Stripe (ex. https://tsaktsak.com). */
  origin: string;
};

const messages = {
  fr: {
    disabled:
      "Le paiement en ligne n’est pas encore activé. Appelez-nous au 514-495-7812 pour commander.",
    noPickup: "Le ramassage n’est pas offert pour le moment.",
    noDelivery: "La livraison n’est pas offerte pour le moment.",
    chooseRestaurant: "Choisissez le restaurant où ramasser votre commande.",
    empty: "Votre panier est vide.",
    gone: "Un produit de votre panier n’est plus offert. Retirez-le puis réessayez.",
    quantity: (name: string) => `Quantité invalide pour « ${name} ».`,
    soldOut: (name: string) => `« ${name} » est en rupture de stock.`,
    onlyLeft: (count: number, name: string) => `Il ne reste que ${count} « ${name} ».`,
    delivery: "Livraison",
    failed:
      "Le paiement n’a pas pu être lancé. Réessayez dans un instant ou appelez-nous au 514-495-7812.",
  },
  en: {
    disabled: "Online payment is not available yet. Call us at 514-495-7812 to order.",
    noPickup: "Pickup is not available at the moment.",
    noDelivery: "Delivery is not available at the moment.",
    chooseRestaurant: "Choose the restaurant where you’ll pick up your order.",
    empty: "Your cart is empty.",
    gone: "A product in your cart is no longer available. Remove it and try again.",
    quantity: (name: string) => `Invalid quantity for “${name}”.`,
    soldOut: (name: string) => `“${name}” is sold out.`,
    onlyLeft: (count: number, name: string) => `Only ${count} “${name}” left.`,
    delivery: "Delivery",
    failed: "Payment could not be started. Please try again shortly or call us at 514-495-7812.",
  },
};

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

class CheckoutError extends Error {}

/**
 * Crée la commande (statut « en attente ») avec les prix de la base, puis la session Stripe
 * Checkout. Le navigateur n’envoie que des identifiants et des quantités : jamais de prix.
 */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const t = messages[input.locale];
  if (!stripeConfigured()) {
    return { ok: false, error: t.disabled };
  }

  const sql = await db();
  const settings = await getSettings(sql);

  try {
    if (!settings.shopOpen) {
      throw new CheckoutError(
        input.locale === "en" && settings.closedMessageEn ? settings.closedMessageEn : settings.closedMessage,
      );
    }
    if (input.fulfillment === "pickup" && !settings.pickupEnabled) throw new CheckoutError(t.noPickup);
    if (input.fulfillment === "delivery" && !settings.deliveryEnabled) {
      throw new CheckoutError(t.noDelivery);
    }
    if (input.fulfillment === "pickup" && !pickupLocations.includes(input.pickupLocation)) {
      throw new CheckoutError(t.chooseRestaurant);
    }

    // Regroupe les lignes d’un même produit.
    const quantities = new Map<string, number>();
    for (const item of input.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
    if (quantities.size === 0) throw new CheckoutError(t.empty);

    const products = await getProductsByIds(sql, [...quantities.keys()]);
    const lines = [...quantities].map(([productId, quantity]) => {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product || !product.isActive) throw new CheckoutError(t.gone);
      const name = productName(product, input.locale);
      if (quantity < 1 || quantity > MAX_QUANTITY) throw new CheckoutError(t.quantity(name));
      if (product.stock !== null && quantity > product.stock) {
        throw new CheckoutError(
          product.stock === 0 ? t.soldOut(name) : t.onlyLeft(product.stock, name),
        );
      }
      return { product, quantity };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);
    const deliveryFee = input.fulfillment === "delivery" ? settings.deliveryFeeCents : 0;
    const taxableBase = settings.taxesEnabled
      ? lines
          .filter((line) => line.product.isTaxable)
          .reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0) + deliveryFee
      : 0;
    const taxes = settings.taxesEnabled ? estimateTaxes(taxableBase).total : 0;
    const taxRates = settings.taxesEnabled ? await ensureTaxRates(sql) : null;

    // 1. La commande, avec une copie des produits au moment de l’achat.
    const order = await sql.begin(async (tx) => {
      const [created] = await tx<{ id: string; number: number }[]>`
        insert into orders (
          customer_name, customer_email, customer_phone, fulfillment, pickup_location,
          delivery_address, customer_note, subtotal_cents, delivery_fee_cents, tax_cents, total_cents,
          locale
        ) values (
          ${input.customer.name}, ${input.customer.email}, ${input.customer.phone}, ${input.fulfillment},
          ${input.fulfillment === "pickup" ? input.pickupLocation : null},
          ${input.fulfillment === "delivery" && input.address ? tx.json(input.address) : null},
          ${input.note}, ${subtotal}, ${deliveryFee}, ${taxes}, ${subtotal + deliveryFee + taxes},
          ${input.locale}
        )
        returning id, number
      `;
      for (const line of lines) {
        await tx`
          insert into order_items (
            order_id, product_id, name, name_en, format, unit_price_cents, quantity, is_taxable
          )
          values (${created.id}, ${line.product.id}, ${line.product.name}, ${line.product.nameEn},
                  ${line.product.format}, ${line.product.priceCents}, ${line.quantity},
                  ${line.product.isTaxable})
        `;
      }
      return created;
    });

    // 2. La session de paiement Stripe.
    const publicImages = input.origin.startsWith("https://");
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "cad",
        unit_amount: line.product.priceCents,
        product_data: {
          name: productName(line.product, input.locale),
          ...(line.product.format ? { description: line.product.format } : {}),
          ...(publicImages && line.product.imageId
            ? { images: [`${input.origin}${mediaUrl(line.product.imageId)}`] }
            : {}),
          metadata: { productId: line.product.id },
        },
      },
      ...(taxRates && line.product.isTaxable ? { tax_rates: [taxRates.gst, taxRates.qst] } : {}),
    }));
    if (deliveryFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: deliveryFee,
          product_data: { name: t.delivery },
        },
        ...(taxRates ? { tax_rates: [taxRates.gst, taxRates.qst] } : {}),
      });
    }

    const metadata = { orderId: order.id, orderNumber: String(order.number) };
    let session: Stripe.Checkout.Session;
    try {
      session = await getStripe().checkout.sessions.create(
        {
          mode: "payment",
          locale: input.locale === "en" ? "en" : "fr-CA",
          line_items: lineItems,
          customer_email: input.customer.email,
          client_reference_id: order.id,
          metadata,
          payment_intent_data: {
            description: `Commande n° ${order.number} — Tsak Tsak${input.locale === "en" ? " (EN)" : ""}`,
            metadata,
          },
          // Une session Stripe expire au plus tôt après 30 minutes.
          expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
          success_url: `${input.origin}${routes.confirmation[input.locale]}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}${routes.cart[input.locale]}?paiement=annule`,
        },
        { idempotencyKey: `checkout-${order.id}` },
      );
    } catch (error) {
      await sql`delete from orders where id = ${order.id}`;
      throw error;
    }

    await sql`
      update orders set stripe_session_id = ${session.id}, updated_at = now() where id = ${order.id}
    `;

    if (!session.url) throw new Error("Stripe n’a pas retourné d’URL de paiement.");
    return { ok: true, url: session.url };
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, error: error.message };
    console.error("[paiement] Échec de création de la session Stripe", error);
    return { ok: false, error: t.failed };
  }
}
