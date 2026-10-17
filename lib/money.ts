const formatters = {
  fr: new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }),
  en: new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }),
};

/** 1250 → « 12,50 $ » (français) ou « $12.50 » (anglais) */
export function formatMoney(cents: number, locale: "fr" | "en" = "fr") {
  return formatters[locale].format(cents / 100);
}

/** « 12,50 », « 12.5 », « 12 $ » → 1250. Retourne null si le montant est invalide. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/\s|\$/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

/** 1250 → « 12,50 » (pour pré-remplir un champ de formulaire) */
export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export const GST_RATE = 0.05;
export const QST_RATE = 0.09975;

/** Estimation des taxes (TPS + TVQ) sur un montant taxable, arrondie comme sur un reçu. */
export function estimateTaxes(taxableCents: number) {
  const gst = Math.round(taxableCents * GST_RATE);
  const qst = Math.round(taxableCents * QST_RATE);
  return { gst, qst, total: gst + qst };
}
