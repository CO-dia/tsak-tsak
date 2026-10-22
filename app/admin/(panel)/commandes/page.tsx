import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { setOrderCompleted, setOrderReady } from "@/app/admin/actions";
import ClickableRow from "@/components/admin/ClickableRow";
import { SubmitButton } from "@/components/admin/forms";
import {
  AdminHeader,
  AdminLoading,
  StatusBadge,
  formatDate,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import {
  countOrdersByStatus,
  getItemsByOrder,
  isStatusGroup,
  listOrders,
  statusGroups,
  type OrderStatus,
} from "@/lib/orders";

export const metadata: Metadata = { title: "Commandes" };

export default function OrdersPage({
  searchParams,
}: PageProps<"/admin/commandes">) {
  return (
    <>
      <AdminHeader eyebrow="Épicerie" title="Commandes" />
      <Suspense fallback={<AdminLoading />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Orders({
  searchParams,
}: {
  searchParams: PageProps<"/admin/commandes">["searchParams"];
}) {
  await requireAdmin();
  const { statut } = await searchParams;
  const group = isStatusGroup(statut)
    ? statut
    : statut === "toutes" || statut === "archivees"
      ? statut
      : "a-preparer";

  const sql = await db();
  const [orders, counts] = await Promise.all([
    listOrders(sql, group),
    countOrdersByStatus(sql),
  ]);
  const itemsByOrder = await getItemsByOrder(
    sql,
    orders.map((order) => order.id),
  );
  const countFor = (statuses: readonly OrderStatus[]) =>
    statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0);

  return (
    <>
      <nav className="admin-tabs" aria-label="Filtrer les commandes">
        {Object.entries(statusGroups).map(([key, value]) => (
          <Link
            key={key}
            href={`/admin/commandes?statut=${key}`}
            className={group === key ? "is-active" : undefined}
            aria-current={group === key ? "page" : undefined}
          >
            {value.label}
            {(key === "a-preparer" || key === "pretes") &&
              countFor(value.statuses) > 0 && (
                <span>{countFor(value.statuses)}</span>
              )}
          </Link>
        ))}
        <Link
          href="/admin/commandes?statut=toutes"
          className={group === "toutes" ? "is-active" : undefined}
          aria-current={group === "toutes" ? "page" : undefined}
        >
          Toutes
        </Link>
        <Link
          href="/admin/commandes?statut=archivees"
          className={group === "archivees" ? "is-active" : undefined}
          aria-current={group === "archivees" ? "page" : undefined}
        >
          Archivées
        </Link>
      </nav>

      {orders.length === 0 ? (
        <p className="admin-empty">Aucune commande dans cette catégorie.</p>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Date</th>
                <th>Client</th>
                <th>Produits</th>
                <th>Réception</th>
                <th>Statut</th>
                <th className="num">Total</th>
                <th>Suivi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <ClickableRow
                  key={order.id}
                  href={`/admin/commandes/${order.id}`}
                >
                  <td>
                    <Link
                      className="row-link"
                      href={`/admin/commandes/${order.id}`}
                    >
                      {order.number}
                    </Link>
                  </td>
                  <td className="muted">
                    {formatDate(order.paidAt ?? order.createdAt)}
                  </td>
                  <td>
                    {order.customerName}
                    <br />
                    <span className="muted">{order.customerPhone}</span>
                    {order.customerEmail && (
                      <>
                        <br />
                        <a
                          className="muted"
                          href={`mailto:${order.customerEmail}`}
                        >
                          {order.customerEmail}
                        </a>
                      </>
                    )}
                  </td>
                  <td>
                    <ul className="order-items-inline">
                      {(itemsByOrder.get(order.id) ?? []).map((item) => (
                        <li key={item.id}>
                          <strong>{item.quantity} ×</strong> {item.name}
                          {item.format ? (
                            <span className="muted"> · {item.format}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {order.fulfillment === "delivery"
                      ? `Livraison · ${order.deliveryAddress?.city ?? ""}`
                      : `Ramassage · ${order.pickupLocation?.replace("Tsak Tsak ", "") ?? ""}`}
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                    {order.stockIssue && (
                      <span className="badge badge--warning">Stock</span>
                    )}
                  </td>
                  <td className="num">{formatMoney(order.totalCents)}</td>
                  <td>
                    <div className="order-quick-actions">
                      {order.status === "paid" && (
                        <form action={setOrderReady}>
                          <input type="hidden" name="id" value={order.id} />
                          <input type="hidden" name="notify" value="on" />
                          <SubmitButton
                            className="button button--olive button--small"
                            pendingLabel="…"
                          >
                            Prête
                          </SubmitButton>
                        </form>
                      )}
                      {(order.status === "paid" ||
                        order.status === "ready") && (
                        <form action={setOrderCompleted}>
                          <input type="hidden" name="id" value={order.id} />
                          <SubmitButton
                            className="button button--dark button--small"
                            pendingLabel="…"
                          >
                            {order.fulfillment === "delivery"
                              ? "Livrée"
                              : "Remise"}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
