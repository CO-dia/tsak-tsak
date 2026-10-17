import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { cancelOrder, refund, saveOrderNote, setOrderCompleted, setOrderReady } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { AdminHeader, AdminLoading, StatusBadge, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatAddress, getOrder, getOrderItems, mapsUrl } from "@/lib/orders";
import { isUuid } from "@/lib/products";
import { stripePaymentUrl } from "@/lib/stripe";

export const metadata: Metadata = { title: "Commande" };

export default function OrderPage({ params }: PageProps<"/admin/commandes/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: { params: PageProps<"/admin/commandes/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const sql = await db();
  const order = await getOrder(sql, id);
  if (!order) notFound();
  const items = await getOrderItems(sql, order.id);

  const paidStatuses = ["paid", "ready", "completed"];

  return (
    <>
      <AdminHeader
        back={
          <Link className="admin-back" href="/admin/commandes">
            ← Commandes
          </Link>
        }
        eyebrow={formatDate(order.createdAt)}
        title={`Commande ${order.number}`}
        actions={<StatusBadge status={order.status} />}
      />

      {order.stockIssue && (
        <p className="notice notice--warning" style={{ marginBottom: 24 }}>
          Le stock était insuffisant pour au moins un produit au moment du paiement. Vérifiez la
          disponibilité avant de préparer la commande.
        </p>
      )}

      <div className="admin-columns admin-columns--order">
        <div>
          <section className="admin-card">
            <h2>Produits</h2>
            <ul className="order-lines">
              {items.map((item) => (
                <li key={item.id}>
                  <span>
                    <strong>{item.quantity} ×</strong> {item.name}
                    {item.format ? <span className="muted"> · {item.format}</span> : null}
                  </span>
                  <span>{formatMoney(item.unitPriceCents * item.quantity)}</span>
                </li>
              ))}
              <li>
                <span className="muted">Sous-total</span>
                <span>{formatMoney(order.subtotalCents)}</span>
              </li>
              {order.fulfillment === "delivery" && (
                <li>
                  <span className="muted">Livraison</span>
                  <span>{order.deliveryFeeCents > 0 ? formatMoney(order.deliveryFeeCents) : "Sans frais"}</span>
                </li>
              )}
              {order.taxCents > 0 && (
                <li>
                  <span className="muted">Taxes</span>
                  <span>{formatMoney(order.taxCents)}</span>
                </li>
              )}
              <li className="order-lines__total">
                <span>Total</span>
                <span>{formatMoney(order.totalCents)}</span>
              </li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Client et réception</h2>
            <dl className="order-meta">
              <div>
                <dt>Client</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>
                  <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
                  <br />
                  <a href={`tel:${order.customerPhone.replace(/[^\d+]/g, "")}`}>{order.customerPhone}</a>
                </dd>
              </div>
              <div>
                <dt>{order.fulfillment === "delivery" ? "Livraison" : "Ramassage"}</dt>
                <dd>
                  {order.fulfillment === "delivery" && order.deliveryAddress ? (
                    <>
                      {formatAddress(order.deliveryAddress)}
                      <br />
                      <a href={mapsUrl(order.deliveryAddress)} target="_blank" rel="noreferrer">
                        Ouvrir dans Google Maps ↗
                      </a>
                    </>
                  ) : (
                    order.pickupLocation
                  )}
                </dd>
              </div>
              <div>
                <dt>Note du client</dt>
                <dd>{order.customerNote || <span className="muted">Aucune</span>}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-card">
            <h2>Note interne</h2>
            <ActionForm action={saveOrderNote} className="admin-form admin-form--single">
              <input type="hidden" name="id" value={order.id} />
              <label className="field">
                <span>Visible seulement dans l’admin</span>
                <textarea name="note" defaultValue={order.adminNote} rows={3} />
              </label>
              <div className="form-footer">
                <SubmitButton className="button button--ghost button--small">Enregistrer la note</SubmitButton>
              </div>
            </ActionForm>
          </section>
        </div>

        <div>
          <section className="admin-card">
            <h2>Suivi</h2>
            <div className="order-steps">
              {order.status === "paid" && (
                <form action={setOrderReady}>
                  <input type="hidden" name="id" value={order.id} />
                  <label className="toggle">
                    <input type="checkbox" name="notify" defaultChecked />
                    <span>
                      <strong>Prévenir le client par courriel</strong>
                      <small>
                        {order.fulfillment === "delivery"
                          ? "« Votre commande est prête et sera bientôt en route »"
                          : `« Votre commande est prête au ${order.pickupLocation} »`}
                      </small>
                    </span>
                  </label>
                  <SubmitButton className="button button--olive">Marquer comme prête</SubmitButton>
                </form>
              )}
              {(order.status === "paid" || order.status === "ready") && (
                <form action={setOrderCompleted}>
                  <input type="hidden" name="id" value={order.id} />
                  <SubmitButton className="button button--dark">
                    {order.fulfillment === "delivery" ? "Marquer comme livrée" : "Marquer comme remise"}
                  </SubmitButton>
                </form>
              )}
              {paidStatuses.includes(order.status) && (
                <ActionForm action={refund}>
                  <input type="hidden" name="id" value={order.id} />
                  <label className="toggle">
                    <input type="checkbox" name="restock" defaultChecked />
                    <span>
                      <strong>Remettre les produits en stock</strong>
                      <small>Pour les produits dont le stock est suivi.</small>
                    </span>
                  </label>
                  <ConfirmButton
                    message={`Rembourser la totalité de la commande ${order.number} (${formatMoney(order.totalCents)}) ? Cette action est définitive.`}
                  >
                    Annuler et rembourser
                  </ConfirmButton>
                </ActionForm>
              )}
              {(order.status === "pending" || order.status === "expired") && (
                <form action={cancelOrder}>
                  <input type="hidden" name="id" value={order.id} />
                  <p className="field__hint">
                    Le client n’a pas terminé son paiement. Aucun montant n’a été prélevé.
                  </p>
                  <ConfirmButton message="Annuler cette commande non payée ?">Annuler la commande</ConfirmButton>
                </form>
              )}
              {(order.status === "completed" || order.status === "cancelled" || order.status === "refunded") && (
                <p className="field__hint">Cette commande est terminée.</p>
              )}
            </div>
          </section>

          <section className="admin-card">
            <h2>Historique</h2>
            <ul className="timeline">
              <li>Créée le {formatDate(order.createdAt)}</li>
              {order.paidAt && <li>Payée le {formatDate(order.paidAt)}</li>}
              {order.readyAt && <li>Prête le {formatDate(order.readyAt)}</li>}
              {order.completedAt && <li>Complétée le {formatDate(order.completedAt)}</li>}
              {order.cancelledAt && (
                <li>
                  {order.status === "refunded" ? "Remboursée" : "Annulée"} le {formatDate(order.cancelledAt)}
                </li>
              )}
            </ul>
            {order.stripePaymentIntentId && (
              <p style={{ marginTop: 16 }}>
                <a className="link-button" href={stripePaymentUrl(order.stripePaymentIntentId)} target="_blank" rel="noreferrer">
                  Voir le paiement dans Stripe ↗
                </a>
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
