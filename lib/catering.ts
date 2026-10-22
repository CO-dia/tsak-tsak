import "server-only";

import type { Queryable } from "@/lib/db";

export type CateringRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  /** Date au format AAAA-MM-JJ. */
  eventDate: string;
  guests: number;
  location: string;
  message: string;
  locale: "fr" | "en";
  handledAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
};

export type NewCateringRequest = Omit<
  CateringRequest,
  "id" | "handledAt" | "archivedAt" | "createdAt"
>;

export async function saveCateringRequest(
  sql: Queryable,
  request: NewCateringRequest,
) {
  await sql`
    insert into catering_requests (name, email, phone, event_type, event_date, guests, location, message, locale)
    values (${request.name}, ${request.email}, ${request.phone}, ${request.eventType}, ${request.eventDate},
            ${request.guests}, ${request.location}, ${request.message}, ${request.locale})
  `;
}

export type CateringView = "a-traiter" | "traitees" | "archivees";

export async function listCateringRequests(
  sql: Queryable,
  view: CateringView,
  limit = 200,
) {
  const where =
    view === "archivees"
      ? sql`archived_at is not null`
      : sql`archived_at is null and (handled_at is not null) = ${view === "traitees"}`;
  return sql<CateringRequest[]>`
    select id, name, email, phone, event_type, event_date::text as event_date, guests, location, message,
           locale, handled_at, archived_at, created_at
    from catering_requests
    where ${where}
    order by created_at desc
    limit ${limit}
  `;
}

export async function countOpenCateringRequests(sql: Queryable) {
  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count from catering_requests where handled_at is null and archived_at is null
  `;
  return count;
}

export async function setCateringHandled(
  sql: Queryable,
  id: string,
  handled: boolean,
) {
  await sql`update catering_requests set handled_at = ${handled ? sql`now()` : null} where id = ${id}`;
}

export async function setCateringArchived(
  sql: Queryable,
  id: string,
  archived: boolean,
) {
  await sql`update catering_requests set archived_at = ${archived ? sql`now()` : null} where id = ${id}`;
}

/** Suppression définitive : seulement depuis les archives, pour éviter de perdre une demande par erreur. */
export async function deleteCateringRequest(sql: Queryable, id: string) {
  await sql`delete from catering_requests where id = ${id} and archived_at is not null`;
}
