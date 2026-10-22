/**
 * Gabarit HTML des courriels envoyés par le site. Compatible avec les clients courriel (tableaux,
 * styles en ligne, polices système). Sans dépendance : utilisable aussi hors de Next (aperçu).
 */

export type EmailBlock =
  | { type: "p"; text: string }
  /** Texte mis en valeur dans un encadré (instructions de ramassage, etc.). */
  | { type: "note"; text: string }
  | { type: "rows"; title?: string; rows: [label: string, value: string][] }
  | {
      type: "items";
      title?: string;
      items: {
        quantity: number;
        name: string;
        detail?: string;
        price: string;
      }[];
      /** Lignes de total ; la dernière est mise en évidence. */
      totals: [label: string, value: string][];
    }
  | { type: "button"; label: string; url: string };

export type EmailContent = {
  lang?: "fr" | "en";
  /** Aperçu affiché par la boîte de réception à côté de l’objet. */
  preheader?: string;
  eyebrow?: string;
  title: string;
  blocks: EmailBlock[];
  /** Adresse publique du site (pour le logo et les liens). */
  siteUrl?: string;
  /** Remplace l’adresse du logo (aperçu local). */
  logoUrl?: string;
};

const colors = {
  brown: "#3b2a20",
  cream: "#f5f0e6",
  paper: "#fdfbf6",
  red: "#a93a2c",
  olive: "#6f8a26",
  line: "#e4dccb",
  muted: "#7a6a5e",
};

const font = `-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
const display = `'Arial Narrow', 'Helvetica Neue', Arial, sans-serif`;

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Échappe le texte et conserve les retours à la ligne. */
function multiline(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function renderBlock(block: EmailBlock): string {
  switch (block.type) {
    case "p":
      return `<p style="margin:0 0 18px;font-size:16px;line-height:1.65;color:${colors.brown};">${multiline(block.text)}</p>`;

    case "note":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr>
        <td style="background:${colors.cream};border-left:4px solid ${colors.olive};padding:16px 18px;font-size:15px;line-height:1.6;color:${colors.brown};">${multiline(block.text)}</td>
      </tr></table>`;

    case "rows":
      return `${heading(block.title)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${block.rows
        .map(
          ([label, value]) => `<tr>
          <td valign="top" width="38%" style="padding:10px 12px 10px 0;border-top:1px solid ${colors.line};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${colors.muted};">${escapeHtml(label)}</td>
          <td valign="top" style="padding:10px 0;border-top:1px solid ${colors.line};font-size:15px;line-height:1.55;color:${colors.brown};">${multiline(value)}</td>
        </tr>`,
        )
        .join("")}</table>`;

    case "items": {
      const lines = block.items
        .map(
          (item) => `<tr>
          <td valign="top" style="padding:12px 0;border-top:1px solid ${colors.line};font-size:15px;line-height:1.5;color:${colors.brown};"><strong>${item.quantity} ×</strong> ${escapeHtml(item.name)}${
            item.detail
              ? `<br><span style="font-size:13px;color:${colors.muted};">${escapeHtml(item.detail)}</span>`
              : ""
          }</td>
          <td valign="top" align="right" style="padding:12px 0 12px 16px;border-top:1px solid ${colors.line};font-size:15px;white-space:nowrap;color:${colors.brown};">${escapeHtml(item.price)}</td>
        </tr>`,
        )
        .join("");
      const lastIndex = block.totals.length - 1;
      const totals = block.totals
        .map(([label, value], index) =>
          index === lastIndex
            ? `<tr>
          <td style="padding:14px 0 0;border-top:2px solid ${colors.brown};font-family:${display};font-size:20px;font-weight:700;text-transform:uppercase;color:${colors.brown};">${escapeHtml(label)}</td>
          <td align="right" style="padding:14px 0 0;border-top:2px solid ${colors.brown};font-family:${display};font-size:20px;font-weight:700;color:${colors.red};">${escapeHtml(value)}</td>
        </tr>`
            : `<tr>
          <td style="padding:4px 0;font-size:14px;color:${colors.muted};">${escapeHtml(label)}</td>
          <td align="right" style="padding:4px 0;font-size:14px;color:${colors.muted};">${escapeHtml(value)}</td>
        </tr>`,
        )
        .join("");
      return `${heading(block.title)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${lines}<tr><td colspan="2" style="padding-top:8px;"></td></tr>${totals}</table>`;
    }

    case "button":
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 24px;"><tr>
        <td bgcolor="${colors.red}" style="background:${colors.red};"><a href="${escapeHtml(block.url)}" style="display:inline-block;padding:15px 30px;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;color:#ffffff;">${escapeHtml(block.label)}</a></td>
      </tr></table>`;
  }
}

function heading(title?: string) {
  if (!title) return "";
  return `<p style="margin:8px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${colors.olive};">${escapeHtml(title)}</p>`;
}

export function renderEmail(content: EmailContent): string {
  const lang = content.lang ?? "fr";
  const siteUrl = (content.siteUrl ?? "https://tsaktsak.com").replace(
    /\/$/,
    "",
  );
  const logo = content.logoUrl ?? `${siteUrl}/brand/logo-light.png`;
  const tagline =
    lang === "en"
      ? "Flavour creator since 2009"
      : "Créateur de saveurs depuis 2009";

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:${colors.cream};font-family:${font};">
${content.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${colors.cream};">${escapeHtml(content.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.cream};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td align="center" bgcolor="${colors.brown}" style="background:${colors.brown};padding:30px 24px;">
      <a href="${escapeHtml(siteUrl)}"><img src="${escapeHtml(logo)}" alt="Tsak Tsak" width="130" style="display:block;border:0;width:130px;height:auto;"></a>
    </td></tr>
    <tr><td bgcolor="${colors.paper}" style="background:${colors.paper};padding:40px 36px 20px;">
      ${content.eyebrow ? `<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${colors.olive};">${escapeHtml(content.eyebrow)}</p>` : ""}
      <h1 style="margin:0 0 24px;font-family:${display};font-size:38px;line-height:1.05;font-weight:700;text-transform:uppercase;color:${colors.brown};">${escapeHtml(content.title)}</h1>
      ${content.blocks.map(renderBlock).join("\n")}
    </td></tr>
    <tr><td bgcolor="${colors.paper}" style="background:${colors.paper};padding:0 36px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${colors.line};padding-top:22px;font-size:13px;line-height:1.7;color:${colors.muted};">
        <strong style="color:${colors.brown};">Tsak Tsak</strong> · ${tagline}<br>
        Beaubien : <a href="tel:5144957812" style="color:${colors.muted};">514-495-7812</a> &nbsp;·&nbsp; Saint-Laurent : <a href="tel:5142723369" style="color:${colors.muted};">514-272-3369</a><br>
        <a href="${escapeHtml(siteUrl)}" style="color:${colors.red};text-decoration:none;">tsaktsak.com</a>
      </td></tr></table>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
