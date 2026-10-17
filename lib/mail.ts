import "server-only";

import nodemailer from "nodemailer";

type Message = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export function mailConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Envoie un courriel texte. Retourne false si l’envoi a échoué ou si le SMTP n’est pas configuré
 * (dans ce cas, en développement, le message est affiché dans la console).
 */
export async function sendMail(message: Message): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[courriel] (SMTP non configuré) À : ${message.to}\nObjet : ${message.subject}\n\n${message.text}`);
      return true;
    }
    console.error(`[courriel] SMTP non configuré : « ${message.subject} » n’a pas été envoyé.`);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM ?? `Tsak Tsak <${process.env.SMTP_USER}>`,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      text: message.text,
    });
    return true;
  } catch (error) {
    console.error(`[courriel] Échec d’envoi de « ${message.subject} »`, error);
    return false;
  }
}

/** Adresse qui reçoit les avis internes (commandes), selon les paramètres puis l’environnement. */
export function shopInbox(fromSettings?: string) {
  return (
    fromSettings?.trim() ||
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.CATERING_EMAIL_TO ||
    process.env.SMTP_USER ||
    ""
  );
}
