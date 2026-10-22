import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  archiveCateringRequest,
  removeCateringRequest,
  setCateringRequestHandled,
} from "@/app/admin/actions";
import { ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { AdminHeader, AdminLoading, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import {
  countOpenCateringRequests,
  listCateringRequests,
  type CateringView,
} from "@/lib/catering";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Demandes traiteur" };

const eventDate = new Intl.DateTimeFormat("fr-CA", {
  dateStyle: "full",
  timeZone: "UTC",
});

export default function CateringRequestsPage({
  searchParams,
}: PageProps<"/admin/demandes">) {
  return (
    <>
      <AdminHeader eyebrow="Traiteur" title="Demandes traiteur" />
      <Suspense fallback={<AdminLoading />}>
        <Requests searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Requests({
  searchParams,
}: {
  searchParams: PageProps<"/admin/demandes">["searchParams"];
}) {
  await requireAdmin();
  const { statut } = await searchParams;
  const view: CateringView =
    statut === "traitees" || statut === "archivees" ? statut : "a-traiter";
  const sql = await db();
  const [requests, open] = await Promise.all([
    listCateringRequests(sql, view),
    countOpenCateringRequests(sql),
  ]);

  return (
    <>
      <nav className="admin-tabs" aria-label="Filtrer les demandes">
        {(
          [
            ["a-traiter", "/admin/demandes", "À traiter"],
            ["traitees", "/admin/demandes?statut=traitees", "Traitées"],
            ["archivees", "/admin/demandes?statut=archivees", "Archivées"],
          ] as const
        ).map(([key, href, label]) => (
          <Link
            key={key}
            href={href}
            className={view === key ? "is-active" : undefined}
            aria-current={view === key ? "page" : undefined}
          >
            {label}
            {key === "a-traiter" && open > 0 && <span>{open}</span>}
          </Link>
        ))}
      </nav>

      {requests.length === 0 ? (
        <p className="admin-empty">
          {view === "traitees"
            ? "Aucune demande traitée."
            : view === "archivees"
              ? "Aucune demande archivée."
              : "Aucune demande à traiter."}
        </p>
      ) : (
        requests.map((request) => (
          <section key={request.id} className="admin-card">
            <h2>
              {request.name} · {request.eventType}
            </h2>
            <dl className="order-meta">
              <div>
                <dt>Reçue le</dt>
                <dd>
                  {formatDate(request.createdAt)}
                  {request.locale === "en" ? " · client anglophone" : ""}
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>
                  <a href={`mailto:${request.email}`}>{request.email}</a>
                  <br />
                  <a href={`tel:${request.phone.replace(/[^\d+]/g, "")}`}>
                    {request.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Événement</dt>
                <dd>
                  {eventDate.format(new Date(`${request.eventDate}T00:00:00Z`))}
                  <br />
                  {request.guests} personnes · {request.location}
                </dd>
              </div>
              <div>
                <dt>Message</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{request.message}</dd>
              </div>
            </dl>
            <div className="order-steps" style={{ marginTop: 16 }}>
              {view !== "archivees" && (
                <form action={setCateringRequestHandled}>
                  <input type="hidden" name="id" value={request.id} />
                  <input
                    type="hidden"
                    name="handled"
                    value={request.handledAt ? "false" : "true"}
                  />
                  <SubmitButton className="button button--dark button--small">
                    {request.handledAt
                      ? "Remettre à traiter"
                      : "Marquer comme traitée"}
                  </SubmitButton>
                </form>
              )}
              <form action={archiveCateringRequest}>
                <input type="hidden" name="id" value={request.id} />
                <input
                  type="hidden"
                  name="archived"
                  value={request.archivedAt ? "false" : "true"}
                />
                <SubmitButton className="button button--ghost button--small">
                  {request.archivedAt ? "Désarchiver" : "Archiver"}
                </SubmitButton>
              </form>
              {request.archivedAt && (
                <form action={removeCateringRequest}>
                  <input type="hidden" name="id" value={request.id} />
                  <ConfirmButton
                    message={`Supprimer définitivement la demande de ${request.name} ? Cette action est irréversible.`}
                  >
                    Supprimer définitivement
                  </ConfirmButton>
                </form>
              )}
            </div>
          </section>
        ))
      )}
    </>
  );
}
