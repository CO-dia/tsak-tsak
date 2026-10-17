import type { ReactNode } from "react";

import { statusLabels, type OrderStatus } from "@/lib/orders";

export function AdminHeader({
  eyebrow,
  title,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="admin-header">
      <div>
        {back}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {actions && <div className="admin-header__actions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge--${status}`}>{statusLabels[status]}</span>;
}

export function AdminLoading() {
  return <p className="admin-loading">Chargement…</p>;
}

const dateFormatter = new Intl.DateTimeFormat("fr-CA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Montreal",
});

export function formatDate(date: Date | null) {
  return date ? dateFormatter.format(date) : "—";
}
