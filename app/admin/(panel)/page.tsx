import Link from "next/link";
import { Suspense } from "react";

import { AdminHeader, AdminLoading, StatusBadge, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { mailConfigured } from "@/lib/mail";
import { formatMoney } from "@/lib/money";
import { countOrdersByStatus, listOrders, salesSummary } from "@/lib/orders";
import { listAllProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { stripeConfigured, stripeMode, stripeWebhookConfigured } from "@/lib/stripe";

export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const admin = await requireAdmin();
  const sql = await db();
  const [counts, sales, recent, products, settings] = await Promise.all([
    countOrdersByStatus(sql),
    salesSummary(sql),
    listOrders(sql, "toutes", 8),
    listAllProducts(sql),
    getSettings(sql),
  ]);

  const activeProducts = products.filter((product) => product.isActive).length;
  const lowStock = products.filter(
    (product) => product.isActive && product.stock !== null && product.stock <= 3,
  );

  const setup = [
    {
      done: stripeConfigured(),
      label: stripeConfigured()
        ? `Paiements Stripe activés (mode ${stripeMode() === "live" ? "réel" : "test"}).`
        : "Ajoutez la clé STRIPE_SECRET_KEY pour activer les paiements.",
    },
    {
      done: stripeWebhookConfigured(),
      label: stripeWebhookConfigured()
        ? "Webhook Stripe configuré."
        : "Configurez le webhook Stripe (STRIPE_WEBHOOK_SECRET) pour confirmer les paiements automatiquement.",
    },
    {
      done: mailConfigured(),
      label: mailConfigured()
        ? "Envoi des courriels configuré."
        : "Configurez le SMTP pour envoyer les confirmations de commande.",
    },
    {
      done: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      label: process.env.GOOGLE_MAPS_API_KEY
        ? "Suggestions d’adresses Google activées."
        : "Ajoutez GOOGLE_MAPS_API_KEY pour les suggestions d’adresses de livraison.",
    },
    {
      done: settings.shopOpen,
      label: settings.shopOpen ? "La boutique accepte les commandes." : "La boutique est fermée.",
    },
  ];

  return (
    <>
      <AdminHeader
        eyebrow={`Bonjour ${admin.name || admin.email}`}
        title="Tableau de bord"
        actions={
          <Link className="button button--dark" href="/admin/produits/nouveau">
            Nouveau produit <span aria-hidden="true">+</span>
          </Link>
        }
      />

      <div className="admin-stats">
        <Link className={`stat ${counts.paid ? "stat--alert" : ""}`} href="/admin/commandes?statut=a-preparer">
          <span className="stat__label">À préparer</span>
          <span className="stat__value">{counts.paid ?? 0}</span>
        </Link>
        <Link className="stat" href="/admin/commandes?statut=pretes">
          <span className="stat__label">Prêtes</span>
          <span className="stat__value">{counts.ready ?? 0}</span>
        </Link>
        <div className="stat">
          <span className="stat__label">Ventes du mois ({sales.monthCount})</span>
          <span className="stat__value">{formatMoney(sales.monthCents)}</span>
        </div>
        <Link className="stat" href="/admin/produits">
          <span className="stat__label">Produits en ligne</span>
          <span className="stat__value">{activeProducts}</span>
        </Link>
      </div>

      <div className="admin-columns">
        <section className="admin-card">
          <div className="admin-card__heading">
            <h2>Dernières commandes</h2>
            <Link className="link-button" href="/admin/commandes?statut=toutes">
              Tout voir
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="admin-empty">Aucune commande pour le moment.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link className="row-link" href={`/admin/commandes/${order.id}`}>
                          {order.number}
                        </Link>
                      </td>
                      <td>{order.customerName}</td>
                      <td className="muted">{formatDate(order.createdAt)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="num">{formatMoney(order.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div>
          <section className="admin-card">
            <h2>Mise en route</h2>
            <ul className="setup-list">
              {setup.map((item) => (
                <li key={item.label} className={item.done ? undefined : "is-missing"}>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
          {lowStock.length > 0 && (
            <section className="admin-card">
              <h2>Stock bas</h2>
              <ul className="setup-list">
                {lowStock.map((product) => (
                  <li key={product.id} className="is-missing">
                    <Link href={`/admin/produits/${product.id}`}>
                      {product.name} : {product.stock} en stock
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
