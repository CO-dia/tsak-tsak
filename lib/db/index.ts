import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { migrations } from "@/lib/db/migrations";

export type Sql = postgres.Sql;
/** Client SQL ou transaction en cours : utilisable par les fonctions appelées dans les deux cas. */
export type Queryable = postgres.ISql;

type DbGlobal = typeof globalThis & {
  __tsakSql?: Sql;
  __tsakReady?: Promise<void>;
};

const store = globalThis as DbGlobal;

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.NODE_ENV !== "production") {
    // Base locale par défaut pour le développement (voir README).
    return "postgres://localhost:5432/tsaktsak";
  }
  throw new Error("DATABASE_URL n’est pas configurée.");
}

function client(): Sql {
  if (!store.__tsakSql) {
    store.__tsakSql = postgres(connectionString(), {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 15,
      transform: postgres.camel,
      onnotice: () => {},
    });
  }
  return store.__tsakSql;
}

/**
 * Retourne le client SQL, après avoir appliqué les migrations (une seule fois par processus).
 * Ne jamais appeler pendant le build : uniquement au moment de la requête.
 */
export async function db(): Promise<Sql> {
  const sql = client();
  if (!store.__tsakReady) {
    store.__tsakReady = prepare(sql).catch((error) => {
      store.__tsakReady = undefined;
      throw error;
    });
  }
  await store.__tsakReady;
  return sql;
}

async function prepare(sql: Sql) {
  await sql.begin(async (tx) => {
    // Verrou pour éviter deux migrations simultanées (plusieurs processus au démarrage).
    await tx`select pg_advisory_xact_lock(727274)`;
    await tx`
      create table if not exists schema_migrations (
        id text primary key,
        applied_at timestamptz not null default now()
      )
    `;
    const done = new Set(
      (await tx<{ id: string }[]>`select id from schema_migrations`).map((row) => row.id),
    );
    for (const migration of migrations) {
      if (done.has(migration.id)) continue;
      await tx.unsafe(migration.sql);
      await tx`insert into schema_migrations (id) values (${migration.id})`;
      console.info(`[db] Migration appliquée : ${migration.id}`);
    }
    await seedDemoProducts(tx);
  });
}

const demoProducts = [
  {
    slug: "sauce-piquante-maison",
    category: "sauces",
    name: "Sauce piquante maison",
    nameEn: "House hot sauce",
    descriptionEn: "Red chilies, roasted garlic and a lightly smoky finish.",
    format: "150 ml",
    description: "Piments rouges, ail rôti et une finale légèrement fumée.",
    priceCents: 1200,
    image: "sauce-piquante.jpg",
  },
  {
    slug: "limonade-tsak-tsak",
    category: "boissons",
    name: "Limonade Tsak Tsak",
    nameEn: "Tsak Tsak lemonade",
    descriptionEn: "Freshly squeezed lemons, lightly sweetened, made in small batches.",
    format: "750 ml",
    description: "Citron pressé, très peu sucrée, préparée en petits lots.",
    priceCents: 850,
    image: "limonade.jpg",
  },
  {
    slug: "confiture-de-saison",
    category: "epicerie-fine",
    name: "Confiture de saison",
    nameEn: "Seasonal jam",
    descriptionEn: "Seasonal fruit, slowly cooked in our kitchen.",
    format: "250 ml",
    description: "Fruits de saison cuits lentement dans notre cuisine.",
    priceCents: 1000,
    image: "confiture.jpg",
  },
  {
    slug: "granola-du-brunch",
    category: "epicerie-fine",
    name: "Granola du brunch",
    nameEn: "Brunch granola",
    descriptionEn: "Oats, nuts, seeds and Québec maple syrup.",
    format: "400 g",
    description: "Avoine, noix, graines et sirop d’érable du Québec.",
    priceCents: 1400,
    image: "granola.jpg",
  },
];

/**
 * Au tout premier démarrage, ajoute les produits du design pour que l’épicerie ne soit pas vide.
 * Ne s’exécute qu’une fois : supprimer ces produits dans l’admin ne les fera pas revenir.
 */
async function seedDemoProducts(sql: Queryable) {
  const [seeded] = await sql`select 1 from settings where key = 'seeded'`;
  if (seeded) return;

  const { storeImage } = await import("@/lib/media");

  for (const [index, product] of demoProducts.entries()) {
    let imageId: string | null = null;
    try {
      const file = await readFile(path.join(process.cwd(), "assets", "images", product.image));
      imageId = await storeImage(sql, file);
    } catch (error) {
      console.warn(`[db] Image de démonstration introuvable : ${product.image}`, error);
    }
    await sql`
      insert into products (
        slug, name, name_en, format, description, description_en, price_cents, image_id, position,
        category_id
      )
      values (${product.slug}, ${product.name}, ${product.nameEn}, ${product.format},
              ${product.description}, ${product.descriptionEn}, ${product.priceCents}, ${imageId},
              ${index}, (select id from categories where slug = ${product.category}))
      on conflict (slug) do nothing
    `;
  }

  await sql`
    insert into settings (key, value) values ('seeded', ${sql.json(true)})
    on conflict (key) do nothing
  `;
  console.info("[db] Produits de démonstration ajoutés.");
}
