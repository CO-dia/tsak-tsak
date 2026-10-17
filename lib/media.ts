import "server-only";

import sharp from "sharp";

import type { Queryable } from "@/lib/db";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];

/** URL publique d’une image stockée en base (servie par app/media/[file]/route.ts). */
export function mediaUrl(id: string) {
  return `/media/${id}.webp`;
}

export function isAcceptedImage(file: File) {
  return file.size > 0 && (ACCEPTED_TYPES.includes(file.type) || file.type === "");
}

/**
 * Redimensionne (1200 px de large au plus), corrige l’orientation et convertit en WebP,
 * puis enregistre l’image en base. Retourne l’identifiant du média.
 */
export async function storeImage(sql: Queryable, input: Buffer | ArrayBuffer) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const { data, info } = await sharp(buffer, { failOn: "error" })
    .rotate()
    .resize({ width: 1200, height: 1500, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const [row] = await sql<{ id: string }[]>`
    insert into media (content_type, data, width, height)
    values ('image/webp', ${data}, ${info.width}, ${info.height})
    returning id
  `;
  return row.id;
}
