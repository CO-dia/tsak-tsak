import "server-only";

/**
 * Mettre `SHOP_COMING_SOON=true` dans l’environnement pour afficher « bientôt disponible » à la
 * place de l’épicerie et du panier, et bloquer les paiements. Lu à chaque requête : on peut
 * l’activer ou le retirer sans reconstruire le site (redémarrer l’application suffit).
 */
export function shopComingSoon() {
  return ["1", "true", "yes", "oui"].includes((process.env.SHOP_COMING_SOON ?? "").trim().toLowerCase());
}
