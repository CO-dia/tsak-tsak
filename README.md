# Tsak Tsak — site web

Site du restaurant Tsak Tsak (Montréal) : pages vitrine, épicerie en ligne avec paiement Stripe,
formulaire traiteur et interface d’administration.

- **Next.js 16** (App Router, Cache Components) · React 19 · TypeScript
- **PostgreSQL** pour les produits, les commandes et les comptes admin (les photos des produits sont
  aussi stockées en base : aucun disque persistant n’est nécessaire)
- **Stripe Checkout** pour les paiements · **Google Places** pour les adresses de livraison
- Design repris du prototype Figma « tsak-tsak prototype modif » (`app/globals.css`)

## Pages

Le site est bilingue : français sans préfixe, anglais sous `/en` avec des adresses traduites
(`lib/i18n.ts`). `proxy.ts` réécrit ces adresses vers `app/[lang]/…`. Les textes sont dans
`lib/dictionaries.ts` (interface) et `lib/content.ts` (menu, adresses, photos).

| Français | Anglais | Rôle |
| --- | --- | --- |
| `/`, `/a-propos`, `/menu` | `/en`, `/en/about`, `/en/menu` | Pages du site |
| `/adresses` | `/en/locations` | Un restaurant par ligne, carte Google cliquable |
| `/traiteur` | `/en/catering` | Traiteur et formulaire de demande |
| `/epicerie` | `/en/shop` | Produits par catégorie, ajout au panier |
| `/panier`, `/panier/confirmation` | `/en/cart`, `/en/cart/confirmation` | Panier, paiement Stripe, confirmation |
| `/admin` | — | Administration (français, connexion requise) |

Pour ajouter une page : créer `app/[lang]/<dossier>/page.tsx`, puis l’ajouter à `routes` dans
`lib/i18n.ts` (adresses FR et EN) et aux dictionnaires.

### Administration (`/admin`)

Masquée pour le moment : `/admin` répond « page introuvable » tant que `ADMIN_ENABLED=true` n’est pas défini dans l’environnement.


- **Tableau de bord** : commandes à préparer, ventes du mois, liste de mise en route.
- **Commandes** : suivi (à préparer → prête → remise/livrée), courriel « commande prête »,
  annulation avec remboursement Stripe, note interne, lien Google Maps pour les livraisons.
- **Produits** : ajout, modification, photo, prix, stock (ou illimité), visibilité, taxes, catégorie,
  nom et description en anglais. Un produit déjà commandé est archivé plutôt que supprimé.
- **Catégories** : les onglets de l’épicerie (Sauces, Boissons…). Nom français et anglais, ordre.
  Supprimer une catégorie laisse ses produits en vente, sans catégorie.
- **Paramètres** : ouvrir ou fermer la boutique, ramassage, livraison (frais fixes, informations),
  TPS et TVQ, courriel des avis de commande. Les messages clients ont une version anglaise
  (sinon le français est affiché).
- **Compte** : changer son mot de passe, donner ou retirer l’accès à d’autres personnes.

### Épicerie « bientôt disponible »

Avec `SHOP_COMING_SOON=true` (variable d’environnement), l’épicerie et le panier affichent
« L’épicerie est en préparation » et les paiements sont bloqués. Retirer la variable (ou la mettre
à `false`) et redémarrer l’application pour ouvrir la boutique.

### Menu

Le menu complet (français et anglais, avec les prix) est dans `lib/menu.ts` : une section par
onglet, des groupes (Omelettes, Cocktails…) et les plats. Modifier le texte ou le prix dans ce fichier.

### Livraison

Il n’y a pas de calcul de livraison : le client choisit « Livraison » et donne son adresse
(suggestions Google si `GOOGLE_MAPS_API_KEY` est définie, sinon saisie manuelle). L’équipe organise
la livraison. Des frais fixes peuvent être ajoutés dans les paramètres (0 $ par défaut).

## Développement local

Prérequis : Node.js 20.9 ou plus récent, PostgreSQL.

```bash
createdb tsaktsak
cp .env.example .env.local   # puis remplir au moins ADMIN_EMAIL et ADMIN_PASSWORD
npm install
npm run dev
```

Sans `DATABASE_URL`, le site utilise `postgres://localhost:5432/tsaktsak` en développement.
Les tables sont créées automatiquement au premier accès (`lib/db/migrations.ts`) et quatre produits
de démonstration sont ajoutés une seule fois.

Sans SMTP en développement, les courriels sont affichés dans la console du serveur.

## Déploiement (Coolify)

1. **Base de données** : dans le projet Coolify, ajouter une ressource **PostgreSQL**. Activer les
   sauvegardes automatiques. Copier son URL interne dans `DATABASE_URL`.
2. **Application** : build pack Railpack, port 3000, branche `main`.
3. **Variables d’environnement** : toutes celles de `.env.example` (`SITE_URL=https://tsaktsak.com`).
4. Déployer, puis se connecter à `https://tsaktsak.com/admin` avec `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` : le compte est créé à cette première connexion.

## Stripe

1. Clé secrète : Stripe → Développeurs → Clés API → `STRIPE_SECRET_KEY`
   (`sk_test_…` pour tester avec les cartes de test, `sk_live_…` pour les vrais paiements).
2. Webhook : Stripe → Développeurs → Webhooks → Ajouter un point de terminaison
   - URL : `https://tsaktsak.com/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.expired`, `charge.refunded`
   - Copier le « secret de signature » (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET`.
3. Les taux TPS (5 %) et TVQ (9,975 %) sont créés automatiquement dans Stripe la première fois
   que les taxes sont activées dans l’admin.

Les prix envoyés à Stripe viennent toujours de la base de données, jamais du navigateur.

## Google Maps (adresses de livraison)

Dans Google Cloud : créer une clé API, activer **Maps JavaScript API** et **Places API (New)**,
puis restreindre la clé aux sites `https://tsaktsak.com/*` (référents HTTP).
La mettre dans `GOOGLE_MAPS_API_KEY`.

## Commandes utiles

```bash
npm run dev     # développement
npm run build   # build de production
npm run lint    # vérification du code
```
