import "server-only";

import type Stripe from "stripe";

import type { Queryable, Sql } from "@/lib/db";
import { renderEmail, type EmailBlock } from "@/lib/email-template";
import { sendMail, shopInbox } from "@/lib/mail";
import { formatMoney } from "@/lib/money";
import {
  getSettings,
  localizedSettings,
  type ShopSettings,
} from "@/lib/settings";
import { getStripe } from "@/lib/stripe";

export type OrderStatus =
  | "pending"
  | "paid"
  | "ready"
  | "completed"
  | "cancelled"
  | "refunded"
  | "expired";

export type DeliveryAddress = {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  placeId?: string;
  lat?: number;
  lng?: number;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  locale: "fr" | "en";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillment: "pickup" | "delivery";
  pickupLocation: string | null;
  deliveryAddress: DeliveryAddress | null;
  customerNote: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  totalCents: number;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  stockIssue: boolean;
  adminNote: string;
  paidAt: Date | null;
  readyAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  nameEn: string;
  format: string;
  unitPriceCents: number;
  quantity: number;
  isTaxable: boolean;
};

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Paiement en attente",
  paid: "À préparer",
  ready: "Prête",
  completed: "Complétée",
  cancelled: "Annulée",
  refunded: "Remboursée",
  expired: "Paiement abandonné",
};

/** Regroupements utilisés par les onglets de l’admin. */
export const statusGroups = {
  "a-preparer": { label: "À préparer", statuses: ["paid"] },
  pretes: { label: "Prêtes", statuses: ["ready"] },
  completees: { label: "Complétées", statuses: ["completed"] },
  annulees: {
    label: "Annulées et remboursées",
    statuses: ["cancelled", "refunded"],
  },
  "non-payees": {
    label: "Paiements non finalisés",
    statuses: ["pending", "expired"],
  },
} as const satisfies Record<string, { label: string; statuses: OrderStatus[] }>;

export type StatusGroup = keyof typeof statusGroups;

export function isStatusGroup(value: unknown): value is StatusGroup {
  return typeof value === "string" && value in statusGroups;
}

export function formatAddress(address: DeliveryAddress) {
  return [
    [address.line1, address.line2].filter(Boolean).join(", "),
    [address.city, address.province, address.postalCode]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

export function mapsUrl(address: DeliveryAddress) {
  const query = encodeURIComponent(formatAddress(address));
  const placeId = address.placeId
    ? `&query_place_id=${encodeURIComponent(address.placeId)}`
    : "";
  return `https://www.google.com/maps/search/?api=1&query=${query}${placeId}`;
}

// ---------- Lecture ----------

export async function getOrder(sql: Queryable, id: string) {
  const [order] = await sql<Order[]>`select * from orders where id = ${id}`;
  return order ?? null;
}

export async function getOrderBySession(sql: Queryable, sessionId: string) {
  const [order] = await sql<
    Order[]
  >`select * from orders where stripe_session_id = ${sessionId}`;
  return order ?? null;
}

export async function getOrderItems(sql: Queryable, orderId: string) {
  return sql<OrderItem[]>`
    select * from order_items where order_id = ${orderId} order by name
  `;
}

/** Produits de plusieurs commandes d’un coup, regroupés par commande (pour les listes). */
export async function getItemsByOrder(sql: Queryable, orderIds: string[]) {
  const grouped = new Map<string, OrderItem[]>();
  if (orderIds.length === 0) return grouped;
  const items = await sql<OrderItem[]>`
    select * from order_items where order_id in ${sql(orderIds)} order by name
  `;
  for (const item of items)
    grouped.set(item.orderId, [...(grouped.get(item.orderId) ?? []), item]);
  return grouped;
}

export async function listOrders(
  sql: Queryable,
  group: StatusGroup | "toutes" | "archivees",
  limit = 200,
) {
  if (group === "archivees") {
    return sql<Order[]>`
      select * from orders where archived_at is not null order by archived_at desc limit ${limit}
    `;
  }
  if (group === "toutes") {
    return sql<Order[]>`
      select * from orders where archived_at is null order by created_at desc limit ${limit}
    `;
  }
  const statuses = [...statusGroups[group].statuses];
  return sql<Order[]>`
    select * from orders where archived_at is null and status in ${sql(statuses)}
    order by ${group === "a-preparer" || group === "pretes" ? sql`paid_at asc` : sql`created_at desc`}
    limit ${limit}
  `;
}

export async function countOrdersByStatus(sql: Queryable) {
  const rows = await sql<{ status: OrderStatus; count: number }[]>`
    select status, count(*)::int as count from orders where archived_at is null group by status
  `;
  const counts = Object.fromEntries(
    rows.map((row) => [row.status, row.count]),
  ) as Partial<Record<OrderStatus, number>>;
  return counts;
}

export async function salesSummary(sql: Queryable) {
  const [row] = await sql<{ monthCents: number; monthCount: number }[]>`
    select coalesce(sum(total_cents), 0)::int as month_cents, count(*)::int as month_count
    from orders
    where status in ('paid', 'ready', 'completed')
      and paid_at >= date_trunc('month', now() at time zone 'America/Montreal') at time zone 'America/Montreal'
  `;
  return row;
}

// ---------- Paiement (Stripe) ----------

/**
 * Marque la commande payée à partir d’une session Checkout réglée. Idempotent : peut être appelé
 * par le webhook et par la page de confirmation sans risque de doublon.
 */
export async function finalizePaidSession(
  sql: Sql,
  session: Stripe.Checkout.Session,
) {
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return null;
  }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const result = await sql.begin(async (tx) => {
    const [order] = await tx<Order[]>`
      update orders set
        status = 'paid',
        paid_at = now(),
        stripe_payment_intent_id = ${paymentIntent ?? null},
        tax_cents = coalesce(${session.total_details?.amount_tax ?? null}::int, tax_cents),
        total_cents = coalesce(${session.amount_total ?? null}::int, total_cents),
        updated_at = now()
      where stripe_session_id = ${session.id} and status in ('pending', 'expired')
      returning *
    `;
    if (!order) return null;

    const items = await tx<
      OrderItem[]
    >`select * from order_items where order_id = ${order.id}`;
    let stockIssue = false;
    for (const item of items) {
      if (!item.productId) continue;
      const [product] = await tx<{ stock: number | null }[]>`
        select stock from products where id = ${item.productId} for update
      `;
      if (!product || product.stock === null) continue;
      if (product.stock < item.quantity) stockIssue = true;
      await tx`
        update products set stock = greatest(stock - ${item.quantity}, 0), updated_at = now()
        where id = ${item.productId}
      `;
    }
    if (stockIssue) {
      await tx`update orders set stock_issue = true where id = ${order.id}`;
    }
    return { order: { ...order, stockIssue }, items };
  });

  if (result) {
    const settings = await getSettings(sql);
    await sendOrderEmails(result.order, result.items, settings);
  }
  return result?.order ?? null;
}

export async function markSessionExpired(sql: Queryable, sessionId: string) {
  await sql`
    update orders set status = 'expired', updated_at = now()
    where stripe_session_id = ${sessionId} and status = 'pending'
  `;
}

/** Remboursement fait depuis le tableau de bord Stripe : on aligne le statut de la commande. */
export async function markPaymentRefunded(
  sql: Queryable,
  paymentIntentId: string,
) {
  await sql`
    update orders set status = 'refunded', cancelled_at = coalesce(cancelled_at, now()), updated_at = now()
    where stripe_payment_intent_id = ${paymentIntentId} and status in ('paid', 'ready', 'completed')
  `;
}

// ---------- Actions de l’admin ----------

export async function markOrderReady(
  sql: Sql,
  orderId: string,
  notifyCustomer: boolean,
) {
  const [order] = await sql<Order[]>`
    update orders set status = 'ready', ready_at = now(), updated_at = now()
    where id = ${orderId} and status = 'paid'
    returning *
  `;
  if (order && notifyCustomer) {
    const settings = await getSettings(sql);
    await sendReadyEmail(order, settings);
  }
  return order ?? null;
}

export async function markOrderCompleted(sql: Queryable, orderId: string) {
  const [order] = await sql<Order[]>`
    update orders set status = 'completed', completed_at = now(), updated_at = now()
    where id = ${orderId} and status in ('paid', 'ready')
    returning *
  `;
  if (order) await sendCompletedEmail(order);
  return order ?? null;
}

/** Rembourse intégralement une commande payée (via Stripe) et la marque remboursée. */
export async function refundOrder(sql: Sql, orderId: string, restock: boolean) {
  const order = await getOrder(sql, orderId);
  if (!order || !["paid", "ready", "completed"].includes(order.status)) {
    throw new Error("Cette commande ne peut pas être remboursée.");
  }
  if (!order.stripePaymentIntentId) {
    throw new Error("Aucun paiement Stripe n’est associé à cette commande.");
  }

  await getStripe().refunds.create(
    {
      payment_intent: order.stripePaymentIntentId,
      reason: "requested_by_customer",
    },
    { idempotencyKey: `refund-${order.id}` },
  );

  await sql.begin(async (tx) => {
    await tx`
      update orders set status = 'refunded', cancelled_at = now(), updated_at = now()
      where id = ${order.id}
    `;
    if (restock) {
      const items = await tx<
        OrderItem[]
      >`select * from order_items where order_id = ${order.id}`;
      for (const item of items) {
        if (!item.productId) continue;
        await tx`
          update products set stock = stock + ${item.quantity}, updated_at = now()
          where id = ${item.productId} and stock is not null
        `;
      }
    }
  });
  await sendRefundEmail(order);
}

/** Annule une commande dont le paiement n’a pas été finalisé (et ferme la page de paiement Stripe). */
export async function cancelUnpaidOrder(sql: Queryable, orderId: string) {
  const [order] = await sql<Order[]>`
    update orders set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = ${orderId} and status in ('pending', 'expired')
    returning *
  `;
  if (order?.stripeSessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        order.stripeSessionId,
      );
      if (session.status === "open")
        await getStripe().checkout.sessions.expire(session.id);
    } catch (error) {
      console.warn("[commandes] Impossible d’expirer la session Stripe", error);
    }
  }
  return order ?? null;
}

/** Range une commande hors des listes (elle reste comptée dans les ventes) ou la ressort des archives. */
export async function setOrderArchived(
  sql: Queryable,
  orderId: string,
  archived: boolean,
) {
  await sql`
    update orders set archived_at = ${archived ? sql`now()` : null}, updated_at = now() where id = ${orderId}
  `;
}

/**
 * Supprime définitivement une commande créée par erreur. Refusé tant que de l’argent a été
 * encaissé (payée, prête, complétée) : il faut d’abord la rembourser, ou simplement l’archiver.
 */
export async function deleteOrder(sql: Queryable, orderId: string) {
  const order = await getOrder(sql, orderId);
  if (!order) return;
  if (["paid", "ready", "completed"].includes(order.status)) {
    throw new Error(
      "Une commande payée ne peut pas être supprimée : remboursez-la d’abord, ou archivez-la.",
    );
  }
  // Ferme la page de paiement Stripe pour qu’un paiement tardif ne tombe pas sur une commande disparue.
  if (order.status === "pending" || order.status === "expired")
    await cancelUnpaidOrder(sql, orderId);
  await sql`delete from orders where id = ${orderId}`;
}

export async function updateAdminNote(
  sql: Queryable,
  orderId: string,
  note: string,
) {
  await sql`update orders set admin_note = ${note}, updated_at = now() where id = ${orderId}`;
}

// ---------- Courriels ----------

const emailText = {
  fr: {
    subtotal: "Sous-total",
    delivery: "Livraison",
    free: "sans frais",
    taxes: "Taxes",
    totalPaid: "Total payé",
    deliveryTo: "Livraison à",
    address: "Adresse",
    place: "Lieu",
    orderEyebrow: (n: number) => `Commande n° ${n}`,
    thanksTitle: "Merci pour votre commande.",
    readyTitle: "Votre commande est prête!",
    pickup: "Ramassage",
    hello: "Bonjour",
    thanksSubject: (n: number) =>
      `Merci pour votre commande n° ${n} — Tsak Tsak`,
    thanks: (n: number) =>
      `Merci pour votre commande n° ${n}! Votre paiement a bien été reçu.`,
    question:
      "Une question? Répondez simplement à ce courriel ou appelez-nous au 514-495-7812.",
    bye: "À bientôt,\nL’équipe Tsak Tsak",
    readySubject: (n: number) => `Votre commande n° ${n} est prête — Tsak Tsak`,
    readyDelivery:
      "Votre commande est prête et sera bientôt en route. Nous vous contacterons pour la livraison.",
    readyPickup: (place: string) =>
      `Votre commande est prête! Vous pouvez venir la chercher au ${place}.`,
    completedSubject: (n: number) =>
      `Merci! Votre commande n° ${n} — Tsak Tsak`,
    completedTitle: "Bon appétit!",
    completedPickup:
      "Votre commande a bien été remise. Merci de votre confiance!",
    completedDelivery:
      "Votre commande a bien été livrée. Merci de votre confiance!",
    completedMore:
      "Nous espérons que vous l’apprécierez. Au plaisir de vous revoir bientôt, à l’épicerie ou à table!",
    refundSubject: (n: number) =>
      `Remboursement de votre commande n° ${n} — Tsak Tsak`,
    refundTitle: "Commande remboursée.",
    refundBody: (amount: string) =>
      `Votre commande a été annulée et nous vous avons remboursé ${amount}. Le montant apparaîtra sur votre relevé de carte d’ici 5 à 10 jours ouvrables, selon votre banque.`,
  },
  en: {
    subtotal: "Subtotal",
    delivery: "Delivery",
    free: "free",
    taxes: "Taxes",
    totalPaid: "Total paid",
    deliveryTo: "Delivery to",
    address: "Address",
    place: "Location",
    orderEyebrow: (n: number) => `Order no. ${n}`,
    thanksTitle: "Thank you for your order.",
    readyTitle: "Your order is ready!",
    pickup: "Pickup",
    hello: "Hello",
    thanksSubject: (n: number) =>
      `Thank you for your order no. ${n} — Tsak Tsak`,
    thanks: (n: number) =>
      `Thank you for your order no. ${n}! We received your payment.`,
    question:
      "Any questions? Simply reply to this email or call us at 514-495-7812.",
    bye: "See you soon,\nThe Tsak Tsak team",
    readySubject: (n: number) => `Your order no. ${n} is ready — Tsak Tsak`,
    readyDelivery:
      "Your order is ready and will be on its way soon. We’ll contact you for the delivery.",
    readyPickup: (place: string) =>
      `Your order is ready! You can pick it up at ${place}.`,
    completedSubject: (n: number) =>
      `Thank you! Your order no. ${n} — Tsak Tsak`,
    completedTitle: "Enjoy!",
    completedPickup:
      "Your order has been handed over. Thank you for your trust!",
    completedDelivery:
      "Your order has been delivered. Thank you for your trust!",
    completedMore:
      "We hope you enjoy it. See you again soon, at the grocery or at the table!",
    refundSubject: (n: number) => `Refund for your order no. ${n} — Tsak Tsak`,
    refundTitle: "Order refunded.",
    refundBody: (amount: string) =>
      `Your order has been cancelled and we refunded ${amount}. The amount will show on your card statement within 5 to 10 business days, depending on your bank.`,
  },
};

function itemsText(order: Order, items: OrderItem[], lang: "fr" | "en") {
  const t = emailText[lang];
  const lines = items.map((item) => {
    const name = lang === "en" && item.nameEn ? item.nameEn : item.name;
    return `- ${item.quantity} × ${name}${item.format ? ` (${item.format})` : ""} : ${formatMoney(
      item.unitPriceCents * item.quantity,
      lang,
    )}`;
  });
  lines.push("", `${t.subtotal} : ${formatMoney(order.subtotalCents, lang)}`);
  if (order.fulfillment === "delivery") {
    lines.push(
      `${t.delivery} : ${order.deliveryFeeCents > 0 ? formatMoney(order.deliveryFeeCents, lang) : t.free}`,
    );
  }
  if (order.taxCents > 0)
    lines.push(`${t.taxes} : ${formatMoney(order.taxCents, lang)}`);
  lines.push(`${t.totalPaid} : ${formatMoney(order.totalCents, lang)}`);
  return lines.join("\n");
}

function itemsBlock(
  order: Order,
  items: OrderItem[],
  lang: "fr" | "en",
  title: string,
): EmailBlock {
  const t = emailText[lang];
  const totals: [string, string][] = [
    [t.subtotal, formatMoney(order.subtotalCents, lang)],
  ];
  if (order.fulfillment === "delivery") {
    totals.push([
      t.delivery,
      order.deliveryFeeCents > 0
        ? formatMoney(order.deliveryFeeCents, lang)
        : t.free,
    ]);
  }
  if (order.taxCents > 0)
    totals.push([t.taxes, formatMoney(order.taxCents, lang)]);
  totals.push([t.totalPaid, formatMoney(order.totalCents, lang)]);
  return {
    type: "items",
    title,
    items: items.map((item) => ({
      quantity: item.quantity,
      name: lang === "en" && item.nameEn ? item.nameEn : item.name,
      detail: item.format || undefined,
      price: formatMoney(item.unitPriceCents * item.quantity, lang),
    })),
    totals,
  };
}

function fulfillmentBlocks(
  order: Order,
  settings: ShopSettings,
  lang: "fr" | "en",
): EmailBlock[] {
  const t = emailText[lang];
  const texts = localizedSettings(settings, lang);
  const delivery = order.fulfillment === "delivery" && order.deliveryAddress;
  const blocks: EmailBlock[] = [
    {
      type: "rows",
      title: delivery ? t.delivery : t.pickup,
      rows: [
        [
          delivery ? t.address : t.place,
          delivery
            ? formatAddress(order.deliveryAddress!)
            : (order.pickupLocation ?? ""),
        ],
      ],
    },
  ];
  const instructions = delivery
    ? texts.deliveryInstructions
    : texts.pickupInstructions;
  if (instructions) blocks.push({ type: "note", text: instructions });
  return blocks;
}

const siteUrl = () => process.env.SITE_URL ?? "https://tsaktsak.com";

function fulfillmentText(
  order: Order,
  settings: ShopSettings,
  lang: "fr" | "en",
) {
  const t = emailText[lang];
  const texts = localizedSettings(settings, lang);
  if (order.fulfillment === "delivery" && order.deliveryAddress) {
    return [
      `${t.deliveryTo} : ${formatAddress(order.deliveryAddress)}`,
      texts.deliveryInstructions,
    ].join("\n");
  }
  return [
    `${t.pickup} : ${order.pickupLocation}`,
    texts.pickupInstructions,
  ].join("\n");
}

async function sendOrderEmails(
  order: Order,
  items: OrderItem[],
  settings: ShopSettings,
) {
  const lang = order.locale ?? "fr";
  const t = emailText[lang];
  const firstName = order.customerName.split(" ")[0];
  await sendMail({
    to: order.customerEmail,
    subject: t.thanksSubject(order.number),
    text: [
      `${t.hello} ${firstName},`,
      "",
      t.thanks(order.number),
      "",
      itemsText(order, items, lang),
      "",
      fulfillmentText(order, settings, lang),
      "",
      t.question,
      "",
      t.bye,
    ].join("\n"),
    html: renderEmail({
      lang,
      siteUrl: siteUrl(),
      preheader: t.thanks(order.number),
      eyebrow: t.orderEyebrow(order.number),
      title: t.thanksTitle,
      blocks: [
        {
          type: "p",
          text: `${t.hello} ${firstName},\n\n${t.thanks(order.number)}`,
        },
        itemsBlock(
          order,
          items,
          lang,
          lang === "en" ? "Your order" : "Votre commande",
        ),
        ...fulfillmentBlocks(order, settings, lang),
        { type: "p", text: `${t.question}\n\n${t.bye}` },
      ],
    }),
    replyTo: shopInbox(settings.notificationEmail) || undefined,
  });

  // Avis interne à l’équipe : toujours en français.
  const inbox = shopInbox(settings.notificationEmail);
  if (!inbox) return;
  await sendMail({
    to: inbox,
    subject: `Nouvelle commande n° ${order.number} — ${
      order.fulfillment === "delivery"
        ? "Livraison"
        : `Ramassage ${order.pickupLocation}`
    }`,
    text: [
      `Commande n° ${order.number} payée (${formatMoney(order.totalCents)}).`,
      lang === "en"
        ? "Client anglophone : la confirmation lui a été envoyée en anglais."
        : "",
      order.stockIssue
        ? "\nATTENTION : stock insuffisant pour au moins un produit.\n"
        : "",
      `Client : ${order.customerName}`,
      `Courriel : ${order.customerEmail}`,
      `Téléphone : ${order.customerPhone}`,
      "",
      itemsText(order, items, "fr"),
      "",
      order.fulfillment === "delivery" && order.deliveryAddress
        ? `Livraison à : ${formatAddress(order.deliveryAddress)}\n${mapsUrl(order.deliveryAddress)}`
        : `Ramassage : ${order.pickupLocation}`,
      order.customerNote ? `\nNote du client : ${order.customerNote}` : "",
      "",
      `Gérer la commande : ${process.env.SITE_URL ?? "https://tsaktsak.com"}/admin/commandes/${order.id}`,
    ]
      .filter((line, index, all) => line !== "" || all[index - 1] !== "")
      .join("\n"),
    html: renderEmail({
      siteUrl: siteUrl(),
      eyebrow: `Commande n° ${order.number}`,
      title: "Nouvelle commande.",
      blocks: [
        ...(order.stockIssue
          ? [
              {
                type: "note",
                text: "ATTENTION : stock insuffisant pour au moins un produit.",
              } as const,
            ]
          : []),
        {
          type: "rows",
          title: "Client",
          rows: [
            ["Nom", order.customerName],
            ["Courriel", order.customerEmail],
            ["Téléphone", order.customerPhone],
            ...(lang === "en"
              ? [["Langue", "Anglais"] as [string, string]]
              : []),
          ],
        },
        itemsBlock(order, items, "fr", "À préparer"),
        {
          type: "rows",
          title: order.fulfillment === "delivery" ? "Livraison" : "Ramassage",
          rows: [
            order.fulfillment === "delivery" && order.deliveryAddress
              ? ["Adresse", formatAddress(order.deliveryAddress)]
              : ["Lieu", order.pickupLocation ?? ""],
          ],
        },
        ...(order.customerNote
          ? [
              {
                type: "note",
                text: `Note du client : ${order.customerNote}`,
              } as const,
            ]
          : []),
        {
          type: "button",
          label: "Gérer la commande",
          url: `${siteUrl()}/admin/commandes/${order.id}`,
        },
      ],
    }),
    replyTo: order.customerEmail,
  });
}

async function sendCompletedEmail(order: Order) {
  const lang = order.locale ?? "fr";
  const t = emailText[lang];
  const firstName = order.customerName.split(" ")[0];
  const done =
    order.fulfillment === "delivery" ? t.completedDelivery : t.completedPickup;
  await sendMail({
    to: order.customerEmail,
    subject: t.completedSubject(order.number),
    text: [
      `${t.hello} ${firstName},`,
      "",
      done,
      "",
      t.completedMore,
      "",
      t.bye,
    ].join("\n"),
    html: renderEmail({
      lang,
      siteUrl: siteUrl(),
      preheader: done,
      eyebrow: t.orderEyebrow(order.number),
      title: t.completedTitle,
      blocks: [
        { type: "p", text: `${t.hello} ${firstName},\n\n${done}` },
        { type: "p", text: t.completedMore },
        { type: "p", text: `${t.question}\n\n${t.bye}` },
      ],
    }),
    replyTo: shopInbox() || undefined,
  });
}

async function sendRefundEmail(order: Order) {
  const lang = order.locale ?? "fr";
  const t = emailText[lang];
  const firstName = order.customerName.split(" ")[0];
  const body = t.refundBody(formatMoney(order.totalCents, lang));
  await sendMail({
    to: order.customerEmail,
    subject: t.refundSubject(order.number),
    text: [
      `${t.hello} ${firstName},`,
      "",
      body,
      "",
      t.question,
      "",
      t.bye,
    ].join("\n"),
    html: renderEmail({
      lang,
      siteUrl: siteUrl(),
      preheader: body,
      eyebrow: t.orderEyebrow(order.number),
      title: t.refundTitle,
      blocks: [
        { type: "p", text: `${t.hello} ${firstName},\n\n${body}` },
        { type: "p", text: `${t.question}\n\n${t.bye}` },
      ],
    }),
    replyTo: shopInbox() || undefined,
  });
}

async function sendReadyEmail(order: Order, settings: ShopSettings) {
  const lang = order.locale ?? "fr";
  const t = emailText[lang];
  const firstName = order.customerName.split(" ")[0];
  await sendMail({
    to: order.customerEmail,
    subject: t.readySubject(order.number),
    text: [
      `${t.hello} ${firstName},`,
      "",
      order.fulfillment === "delivery"
        ? t.readyDelivery
        : t.readyPickup(order.pickupLocation ?? ""),
      "",
      t.bye,
    ].join("\n"),
    html: renderEmail({
      lang,
      siteUrl: siteUrl(),
      preheader:
        order.fulfillment === "delivery"
          ? t.readyDelivery
          : t.readyPickup(order.pickupLocation ?? ""),
      eyebrow: t.orderEyebrow(order.number),
      title: t.readyTitle,
      blocks: [
        { type: "p", text: `${t.hello} ${firstName},` },
        {
          type: "p",
          text:
            order.fulfillment === "delivery"
              ? t.readyDelivery
              : t.readyPickup(order.pickupLocation ?? ""),
        },
        { type: "p", text: t.bye },
      ],
    }),
    replyTo: shopInbox(settings.notificationEmail) || undefined,
  });
}
