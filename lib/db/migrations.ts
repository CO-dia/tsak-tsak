/**
 * Migrations SQL, appliquées automatiquement (dans l’ordre) au premier accès à la base.
 * Ne jamais modifier une migration déjà déployée : en ajouter une nouvelle à la fin.
 */
export const migrations: { id: string; sql: string }[] = [
  {
    id: "001_boutique",
    sql: /* sql */ `
      create table media (
        id uuid primary key default gen_random_uuid(),
        content_type text not null,
        data bytea not null,
        width integer not null,
        height integer not null,
        created_at timestamptz not null default now()
      );

      create table products (
        id uuid primary key default gen_random_uuid(),
        slug text not null unique,
        name text not null,
        format text not null default '',
        description text not null default '',
        price_cents integer not null check (price_cents >= 0),
        image_id uuid references media(id) on delete set null,
        stock integer check (stock is null or stock >= 0),
        is_active boolean not null default true,
        is_taxable boolean not null default false,
        position integer not null default 0,
        archived_at timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create sequence order_number_seq start 1001;

      create table orders (
        id uuid primary key default gen_random_uuid(),
        number integer not null unique default nextval('order_number_seq'),
        status text not null default 'pending'
          check (status in ('pending', 'paid', 'ready', 'completed', 'cancelled', 'refunded', 'expired')),
        customer_name text not null,
        customer_email text not null,
        customer_phone text not null,
        fulfillment text not null check (fulfillment in ('pickup', 'delivery')),
        pickup_location text,
        delivery_address jsonb,
        customer_note text not null default '',
        subtotal_cents integer not null,
        delivery_fee_cents integer not null default 0,
        tax_cents integer not null default 0,
        total_cents integer not null,
        stripe_session_id text unique,
        stripe_payment_intent_id text,
        stock_issue boolean not null default false,
        admin_note text not null default '',
        paid_at timestamptz,
        ready_at timestamptz,
        completed_at timestamptz,
        cancelled_at timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create index orders_status_created_idx on orders (status, created_at desc);
      create index orders_payment_intent_idx on orders (stripe_payment_intent_id);

      create table order_items (
        id uuid primary key default gen_random_uuid(),
        order_id uuid not null references orders(id) on delete cascade,
        product_id uuid references products(id) on delete set null,
        name text not null,
        format text not null default '',
        unit_price_cents integer not null,
        quantity integer not null check (quantity > 0),
        is_taxable boolean not null default false
      );

      create index order_items_order_idx on order_items (order_id);

      create table settings (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      );

      create table admin_users (
        id uuid primary key default gen_random_uuid(),
        email text not null unique,
        name text not null default '',
        password_hash text not null,
        last_login_at timestamptz,
        created_at timestamptz not null default now()
      );

      create table admin_sessions (
        token_hash text primary key,
        user_id uuid not null references admin_users(id) on delete cascade,
        expires_at timestamptz not null,
        created_at timestamptz not null default now()
      );
    `,
  },
  {
    id: "002_categories_et_anglais",
    sql: /* sql */ `
      create table categories (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        name_en text not null default '',
        slug text not null unique,
        position integer not null default 0,
        created_at timestamptz not null default now()
      );

      alter table products add column category_id uuid references categories(id) on delete set null;
      alter table products add column name_en text not null default '';
      alter table products add column description_en text not null default '';
      create index products_category_idx on products (category_id);

      alter table orders add column locale text not null default 'fr' check (locale in ('fr', 'en'));
      alter table order_items add column name_en text not null default '';

      insert into categories (name, name_en, slug, position) values
        ('Sauces', 'Sauces', 'sauces', 0),
        ('Boissons', 'Drinks', 'boissons', 1),
        ('Épicerie fine', 'Pantry', 'epicerie-fine', 2);

      update products set category_id = (select id from categories where slug = 'sauces')
        where slug = 'sauce-piquante-maison';
      update products set category_id = (select id from categories where slug = 'boissons')
        where slug = 'limonade-tsak-tsak';
      update products set category_id = (select id from categories where slug = 'epicerie-fine')
        where slug in ('confiture-de-saison', 'granola-du-brunch');
    `,
  },
  {
    id: "003_commandes_archivees",
    sql: /* sql */ `
      alter table orders add column archived_at timestamptz;
      create index orders_archived_idx on orders (archived_at);
    `,
  },
  {
    id: "004_demandes_traiteur",
    sql: /* sql */ `
      create table catering_requests (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        email text not null,
        phone text not null,
        event_type text not null,
        event_date date not null,
        guests integer not null,
        location text not null,
        message text not null,
        locale text not null default 'fr' check (locale in ('fr', 'en')),
        handled_at timestamptz,
        created_at timestamptz not null default now()
      );

      create index catering_requests_created_idx on catering_requests (created_at desc);
    `,
  },
  {
    id: "005_tentatives_connexion",
    sql: /* sql */ `
      create table login_attempts (
        id bigserial primary key,
        key text not null,
        created_at timestamptz not null default now()
      );

      create index login_attempts_key_idx on login_attempts (key, created_at);
    `,
  },
  {
    id: "006_demandes_archivees",
    sql: /* sql */ `
      alter table catering_requests add column archived_at timestamptz;
    `,
  },
];
