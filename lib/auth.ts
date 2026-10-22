import "server-only";

import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
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
  const actual = await scrypt(
    password,
    Buffer.from(salt, "base64"),
    expected.length,
    {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT.maxmem,
    },
  );
  return timingSafeEqual(actual, expected);
}

export function passwordProblem(password: string) {
  if (password.length < 10)
    return "Le mot de passe doit contenir au moins 10 caractères.";
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

// ---------- Limite de tentatives de connexion (en base : survit aux redémarrages) ----------

const WINDOW_MINUTES = 15;
/** Échecs tolérés par fenêtre : par adresse IP, et par courriel (protège un compte précis). */
const MAX_FAILURES_PER_IP = 10;
const MAX_FAILURES_PER_EMAIL = 6;

function attemptKeys(ip: string, email: string) {
  return { ip: `ip:${ip}`, email: `email:${email}` };
}

async function failureCount(sql: Queryable, key: string) {
  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count from login_attempts
    where key = ${key} and created_at > now() - make_interval(mins => ${WINDOW_MINUTES})
  `;
  return count;
}

export async function tooManyAttempts(
  sql: Queryable,
  ip: string,
  email: string,
) {
  const keys = attemptKeys(ip, email);
  const [byIp, byEmail] = await Promise.all([
    failureCount(sql, keys.ip),
    failureCount(sql, keys.email),
  ]);
  return byIp >= MAX_FAILURES_PER_IP || byEmail >= MAX_FAILURES_PER_EMAIL;
}

export async function recordFailure(sql: Queryable, ip: string, email: string) {
  const keys = attemptKeys(ip, email);
  await sql`insert into login_attempts (key) values (${keys.ip}), (${keys.email})`;
  await sql`delete from login_attempts where created_at < now() - interval '1 day'`;
}

/** Après une connexion réussie : le compte repart à zéro (l’adresse IP garde son historique). */
export async function clearFailures(sql: Queryable, email: string) {
  await sql`delete from login_attempts where key = ${attemptKeys("", email).email}`;
}

// ---------- Connexion : mêmes délais que le courriel existe ou non ----------

let dummyHash: Promise<string> | undefined;

/**
 * Vérifie un mot de passe contre un faux hachage quand le courriel est inconnu, pour que la
 * réponse prenne le même temps et ne révèle pas quels courriels ont un compte.
 */
export async function verifyAgainstDummy(password: string) {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  await verifyPassword(password, await dummyHash);
  return false;
}

// ---------- Autres sessions ----------

/** Déconnecte toutes les sessions d’un administrateur, sauf (optionnellement) celle en cours. */
export async function destroyOtherSessions(sql: Queryable, userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const keep = token ? hashToken(token) : "";
  await sql`delete from admin_sessions where user_id = ${userId} and token_hash <> ${keep}`;
}
