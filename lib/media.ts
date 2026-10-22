import "server-only";

import sharp, { type OutputInfo } from "sharp";

import type { Queryable } from "@/lib/db";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

/** URL publique d’une image stockée en base (servie par app/media/[file]/route.ts). */
export function mediaUrl(id: string) {
  return `/media/${id}.webp`;
}

export function isAcceptedImage(file: File) {
  return (
    file.size > 0 && (ACCEPTED_TYPES.includes(file.type) || file.type === "")
  );
}

/** Poids visé pour une photo de produit : assez fin pour le site, léger pour le chargement. */
const TARGET_BYTES = 180 * 1024;
/** Protège le serveur d’une image « bombe » (dimensions démesurées). */
const MAX_INPUT_PIXELS = 100_000_000;

/** Essais de compression, du plus fidèle au plus léger : on garde le premier qui rentre dans le poids visé. */
const ATTEMPTS: { width: number; height: number; quality: number }[] = [
  { width: 1200, height: 1500, quality: 82 },
  { width: 1200, height: 1500, quality: 72 },
  { width: 1000, height: 1250, quality: 70 },
  { width: 1000, height: 1250, quality: 60 },
  { width: 800, height: 1000, quality: 60 },
  { width: 800, height: 1000, quality: 50 },
];

/**
 * Redimensionne, corrige l’orientation, retire les métadonnées (GPS, appareil…) et convertit en
 * WebP, en resserrant la compression tant que l’image dépasse le poids visé. Puis enregistre
 * l’image en base. Retourne l’identifiant du média.
 */
export async function storeImage(sql: Queryable, input: Buffer | ArrayBuffer) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);

  let best: { data: Buffer; info: OutputInfo } | null = null;
  for (const attempt of ATTEMPTS) {
    best = await sharp(buffer, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize({
        width: attempt.width,
        height: attempt.height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: attempt.quality, effort: 5, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    if (best.data.length <= TARGET_BYTES) break;
  }
  const { data, info } = best!;

  const [row] = await sql<{ id: string }[]>`
    insert into media (content_type, data, width, height)
    values ('image/webp', ${data}, ${info.width}, ${info.height})
    returning id
  `;
  return row.id;
}
