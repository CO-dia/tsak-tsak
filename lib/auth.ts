import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db, type Queryable } from "@/lib/db";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

export const SESSION_COOKIE = "tt_admin";
const SESSION_DAYS = 14;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export type AdminUser = { id: string; email: string; name: string };

// ---------- Mots de passe ----------

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return timingSafeEqual(actual, expected);
}

export function passwordProblem(password: string) {
  if (password.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
  if (password.length > 200) return "Le mot de passe est trop long.";
  return null;
}

// ---------- Sessions ----------

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(sql: Queryable, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    insert into admin_sessions (token_hash, user_id, expires_at)
    values (${hashToken(token)}, ${userId}, ${expiresAt})
  `;
  await sql`delete from admin_sessions where expires_at < now()`;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const sql = await db();
    await sql`delete from admin_sessions where token_hash = ${hashToken(token)}`;
  }
  store.delete({ name: SESSION_COOKIE, path: "/admin" });
}

/** L’administrateur connecté, ou null. Mis en cache pour la durée de la requête. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sql = await db();
  const [user] = await sql<AdminUser[]>`
    select u.id, u.email, u.name
    from admin_sessions s join admin_users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()
  `;
  return user ?? null;
});

/** À appeler au début de chaque page et action de l’admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/connexion");
  return admin;
}

// ---------- Limite de tentatives de connexion (en mémoire, par adresse IP) ----------

const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

export function tooManyAttempts(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  attempts.set(key, recent);
  return recent.length >= MAX_FAILURES;
}

export function recordFailure(key: string) {
  attempts.set(key, [...(attempts.get(key) ?? []), Date.now()]);
}

export function clearFailures(key: string) {
  attempts.delete(key);
}
