import { db } from "@/lib/db";
import { isUuid } from "@/lib/products";

/** Sert les images des produits enregistrées en base : /media/<uuid>.webp */
export async function GET(_request: Request, { params }: RouteContext<"/media/[file]">) {
  const { file } = await params;
  const id = file.replace(/\.webp$/, "");
  if (!isUuid(id)) return new Response("Introuvable", { status: 404 });

  const sql = await db();
  const [media] = await sql<{ contentType: string; data: Buffer }[]>`
    select content_type, data from media where id = ${id}
  `;
  if (!media) return new Response("Introuvable", { status: 404 });

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.contentType,
      // Une image téléversée ne change jamais : une nouvelle image reçoit un nouvel identifiant.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
