import "server-only";

import type { Queryable } from "@/lib/db";
import { getSettings } from "@/lib/settings";

/**
 * Vrai quand l’épicerie et le panier affichent « bientôt disponible » (et que les paiements sont
 * bloqués). Se règle depuis l’admin (Paramètres) ; `SHOP_COMING_SOON=true` dans l’environnement
 * force aussi ce mode, quoi qu’indique l’admin. Lu à chaque requête.
 */
export async function shopHidden(sql: Queryable) {
  if (
    ["1", "true", "yes", "oui"].includes(
      (process.env.SHOP_COMING_SOON ?? "").trim().toLowerCase(),
    )
  ) {
    return true;
  }
  return !(await getSettings(sql)).shopVisible;
}
