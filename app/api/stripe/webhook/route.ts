import type Stripe from "stripe";

import { db } from "@/lib/db";
import { finalizePaidSession, markPaymentRefunded, markSessionExpired } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

/**
 * Webhook Stripe. Événements à activer dans Stripe : checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.expired et charge.refunded.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return new Response("Webhook non configuré", { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  const sql = await db();
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await finalizePaidSession(sql, event.data.object);
      break;
    case "checkout.session.expired":
      await markSessionExpired(sql, event.data.object.id);
      break;
    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntent =
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (paymentIntent && charge.refunded) await markPaymentRefunded(sql, paymentIntent);
      break;
    }
  }

  return Response.json({ received: true });
}
