"use server";

import { timingSafeEqual } from "node:crypto";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearFailures,
  createSession,
  destroySession,
  hashPassword,
  passwordProblem,
  recordFailure,
  requireAdmin,
  tooManyAttempts,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { isAcceptedImage, MAX_UPLOAD_BYTES, storeImage } from "@/lib/media";
import { parseMoney } from "@/lib/money";
import {
  cancelUnpaidOrder,
  markOrderCompleted,
  markOrderReady,
  refundOrder,
  updateAdminNote,
} from "@/lib/orders";
import { isUuid, slugify } from "@/lib/products";
import { getSettings, saveSettings as persistSettings } from "@/lib/settings";

export type FormState = { error?: string; success?: string };

function text(formData: FormData, name: string, max = 500) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function sameText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// ---------- Connexion ----------

export async function login(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email", 200).toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "local";

  if (tooManyAttempts(ip)) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  const sql = await db();
  let [user] = await sql<{ id: string; passwordHash: string }[]>`
    select id, password_hash from admin_users where email = ${email}
  `;

  if (!user) {
    const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from admin_users`;
    if (count === 0) {
      // Premier accès : le compte est créé à partir de ADMIN_EMAIL et ADMIN_PASSWORD.
      const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const bootstrapPassword = process.env.ADMIN_PASSWORD;
      if (!bootstrapEmail || !bootstrapPassword) {
        return {
          error:
            "Aucun compte administrateur n’existe encore. Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans la configuration du serveur.",
        };
      }
      if (email === bootstrapEmail && sameText(password, bootstrapPassword)) {
        [user] = await sql<{ id: string; passwordHash: string }[]>`
          insert into admin_users (email, name, password_hash)
          values (${email}, 'Administrateur', ${await hashPassword(password)})
          on conflict (email) do update set email = excluded.email
          returning id, password_hash
        `;
      }
    }
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    recordFailure(ip);
    return { error: "Courriel ou mot de passe incorrect." };
  }

  clearFailures(ip);
  await sql`update admin_users set last_login_at = now() where id = ${user.id}`;
  await createSession(sql, user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/connexion");
}

// ---------- Produits ----------

export async function saveProduct(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const sql = await db();

  const id = text(formData, "id", 60);
  const name = text(formData, "name", 120);
  const nameEn = text(formData, "nameEn", 120);
  const format = text(formData, "format", 60);
  const description = text(formData, "description", 1000);
  const descriptionEn = text(formData, "descriptionEn", 1000);
  const categoryInput = text(formData, "categoryId", 60);
  const price = parseMoney(text(formData, "price", 20));
  const stockInput = text(formData, "stock", 10);
  const stock = stockInput === "" ? null : Number(stockInput);
  const position = Number(text(formData, "position", 10) || "0");
  const image = formData.get("image");

  if (name.length < 2) return { error: "Indiquez le nom du produit." };
  if (price === null || price <= 0 || price > 100_000) {
    return { error: "Indiquez un prix valide (ex. 12,50)." };
  }
  if (stock !== null && (!Number.isInteger(stock) || stock < 0 || stock > 100_000)) {
    return { error: "Le stock doit être un nombre entier (laisser vide pour un stock illimité)." };
  }
  if (!Number.isInteger(position)) return { error: "L’ordre d’affichage doit être un nombre entier." };

  let categoryId: string | null = null;
  if (categoryInput) {
    const [category] = isUuid(categoryInput)
      ? await sql<{ id: string }[]>`select id from categories where id = ${categoryInput}`
      : [];
    if (!category) return { error: "Cette catégorie n’existe plus. Choisissez-en une autre." };
    categoryId = category.id;
  }

  let imageId: string | undefined;
  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_UPLOAD_BYTES) return { error: "L’image dépasse 10 Mo." };
    if (!isAcceptedImage(image)) return { error: "Format d’image non pris en charge (JPEG, PNG ou WebP)." };
    try {
      imageId = await storeImage(sql, await image.arrayBuffer());
    } catch {
      return { error: "Cette image n’a pas pu être lue. Essayez un fichier JPEG ou PNG." };
    }
  }

  const values = {
    name,
    nameEn,
    format,
    description,
    descriptionEn,
    categoryId,
    priceCents: price,
    stock,
    position,
    isActive: checked(formData, "isActive"),
    isTaxable: checked(formData, "isTaxable"),
  };

  if (id) {
    if (!isUuid(id)) return { error: "Produit introuvable." };
    const [previous] = await sql<{ imageId: string | null }[]>`
      select image_id from products where id = ${id} and archived_at is null
    `;
    if (!previous) return { error: "Produit introuvable." };
    await sql`
      update products set
        name = ${values.name}, name_en = ${values.nameEn}, format = ${values.format},
        description = ${values.description}, description_en = ${values.descriptionEn},
        category_id = ${values.categoryId},
        price_cents = ${values.priceCents}, stock = ${values.stock}, position = ${values.position},
        is_active = ${values.isActive}, is_taxable = ${values.isTaxable},
        image_id = ${imageId ?? previous.imageId}, updated_at = now()
      where id = ${id}
    `;
    if (imageId && previous.imageId) {
      await sql`delete from media where id = ${previous.imageId}`;
    }
  } else {
    const base = slugify(name);
    const [{ taken }] = await sql<{ taken: number }[]>`
      select count(*)::int as taken from products where slug = ${base} or slug like ${`${base}-%`}
    `;
    await sql`
      insert into products (slug, name, name_en, format, description, description_en, category_id,
                            price_cents, stock, position, is_active, is_taxable, image_id)
      values (${taken ? `${base}-${taken + 1}` : base}, ${values.name}, ${values.nameEn}, ${values.format},
              ${values.description}, ${values.descriptionEn}, ${values.categoryId},
              ${values.priceCents}, ${values.stock}, ${values.position}, ${values.isActive}, ${values.isTaxable},
              ${imageId ?? null})
    `;
  }

  redirect("/admin/produits");
}

export async function toggleProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 60);
  if (!isUuid(id)) return;
  const sql = await db();
  await sql`update products set is_active = not is_active, updated_at = now() where id = ${id}`;
  refresh();
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 60);
  if (!isUuid(id)) return;
  const sql = await db();
  const [{ used }] = await sql<{ used: number }[]>`
    select count(*)::int as used from order_items where product_id = ${id}
  `;
  if (used > 0) {
    // Déjà commandé : on l’archive pour garder l’historique des commandes.
    await sql`
      update products set archived_at = now(), is_active = false, updated_at = now() where id = ${id}
    `;
  } else {
    const [deleted] = await sql<{ imageId: string | null }[]>`
      delete from products where id = ${id} returning image_id
    `;
    if (deleted?.imageId) await sql`delete from media where id = ${deleted.imageId}`;
  }
  redirect("/admin/produits");
}

// ---------- Catégories ----------

export async function saveCategory(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const sql = await db();
  const id = text(formData, "id", 60);
  const name = text(formData, "name", 60);
  const nameEn = text(formData, "nameEn", 60);
  const position = Number(text(formData, "position", 10) || "0");

  if (name.length < 2) return { error: "Indiquez le nom de la catégorie." };
  if (!Number.isInteger(position)) return { error: "L’ordre d’affichage doit être un nombre entier." };
  if (id && !isUuid(id)) return { error: "Catégorie introuvable." };

  // Adresse du filtre (?categorie=…) : tirée du nom français, unique.
  const base = slugify(name);
  const used = await sql<{ slug: string }[]>`
    select slug from categories
    where (slug = ${base} or slug like ${`${base}-%`}) and id is distinct from ${id || null}
  `;
  const slugs = new Set(used.map((row) => row.slug));
  let slug = base;
  for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;

  if (id) {
    const updated = await sql`
      update categories set name = ${name}, name_en = ${nameEn}, slug = ${slug}, position = ${position}
      where id = ${id}
      returning id
    `;
    if (updated.length === 0) return { error: "Catégorie introuvable." };
    refresh();
    return { success: "Catégorie enregistrée." };
  }

  await sql`
    insert into categories (name, name_en, slug, position)
    values (${name}, ${nameEn}, ${slug}, ${position})
  `;
  refresh();
  return { success: `Catégorie « ${name} » ajoutée.` };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id", 60);
  if (!isUuid(id)) return;
  const sql = await db();
  // Les produits de cette catégorie restent en vente, simplement sans catégorie.
  await sql`delete from categories where id = ${id}`;
  refresh();
}

// ---------- Commandes ----------

function orderId(formData: FormData) {
  const id = text(formData, "id", 60);
  if (!isUuid(id)) throw new Error("Commande introuvable.");
  return id;
}

export async function setOrderReady(formData: FormData) {
  await requireAdmin();
  const sql = await db();
  await markOrderReady(sql, orderId(formData), checked(formData, "notify"));
  refresh();
}

export async function setOrderCompleted(formData: FormData) {
  await requireAdmin();
  const sql = await db();
  await markOrderCompleted(sql, orderId(formData));
  refresh();
}

export async function refund(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const sql = await db();
  try {
    await refundOrder(sql, orderId(formData), checked(formData, "restock"));
  } catch (error) {
    console.error("[admin] Remboursement impossible", error);
    return {
      error:
        error instanceof Error && !("type" in error)
          ? error.message
          : "Le remboursement a échoué. Vérifiez la commande dans le tableau de bord Stripe.",
    };
  }
  refresh();
  return { success: "La commande a été remboursée." };
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();
  const sql = await db();
  await cancelUnpaidOrder(sql, orderId(formData));
  refresh();
}

export async function saveOrderNote(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const sql = await db();
  await updateAdminNote(sql, orderId(formData), text(formData, "note", 2000));
  refresh();
  return { success: "Note enregistrée." };
}

// ---------- Paramètres ----------

export async function saveSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const sql = await db();
  const current = await getSettings(sql);
  const fee = parseMoney(text(formData, "deliveryFee", 20) || "0");
  if (fee === null || fee > 100_000) return { error: "Frais de livraison invalides (ex. 8,00)." };

  const notificationEmail = text(formData, "notificationEmail", 200);
  if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
    return { error: "Adresse courriel des avis de commande invalide." };
  }

  const next = {
    ...current,
    shopOpen: checked(formData, "shopOpen"),
    closedMessage: text(formData, "closedMessage", 300) || current.closedMessage,
    closedMessageEn: text(formData, "closedMessageEn", 300) || current.closedMessageEn,
    pickupEnabled: checked(formData, "pickupEnabled"),
    pickupInstructions: text(formData, "pickupInstructions", 600),
    pickupInstructionsEn: text(formData, "pickupInstructionsEn", 600),
    deliveryEnabled: checked(formData, "deliveryEnabled"),
    deliveryFeeCents: fee,
    deliveryInstructions: text(formData, "deliveryInstructions", 600),
    deliveryInstructionsEn: text(formData, "deliveryInstructionsEn", 600),
    taxesEnabled: checked(formData, "taxesEnabled"),
    gstNumber: text(formData, "gstNumber", 40),
    qstNumber: text(formData, "qstNumber", 40),
    notificationEmail,
  };
  if (!next.pickupEnabled && !next.deliveryEnabled) {
    return { error: "Activez au moins le ramassage ou la livraison." };
  }

  await persistSettings(sql, next);
  refresh();
  return { success: "Paramètres enregistrés." };
}

// ---------- Comptes ----------

export async function changePassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (next !== String(formData.get("confirm") ?? "")) {
    return { error: "Les deux nouveaux mots de passe ne correspondent pas." };
  }

  const sql = await db();
  const [user] = await sql<{ passwordHash: string }[]>`
    select password_hash from admin_users where id = ${admin.id}
  `;
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "Le mot de passe actuel est incorrect." };
  }
  await sql`update admin_users set password_hash = ${await hashPassword(next)} where id = ${admin.id}`;
  return { success: "Mot de passe modifié." };
}

export async function createAdmin(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const email = text(formData, "email", 200).toLowerCase();
  const name = text(formData, "name", 100);
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse courriel invalide." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const sql = await db();
  const created = await sql`
    insert into admin_users (email, name, password_hash)
    values (${email}, ${name}, ${await hashPassword(password)})
    on conflict (email) do nothing
    returning id
  `;
  if (created.length === 0) return { error: "Un compte existe déjà avec cette adresse." };
  refresh();
  return { success: `Accès créé pour ${email}.` };
}

export async function deleteAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id", 60);
  if (!isUuid(id) || id === admin.id) return;
  const sql = await db();
  await sql`delete from admin_users where id = ${id}`;
  refresh();
}
