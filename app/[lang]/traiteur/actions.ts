"use server";

import { eventLocations, eventTypes } from "@/lib/content";
import { renderEmail } from "@/lib/email-template";
import { saveCateringRequest } from "@/lib/catering";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { mailConfigured, sendMail } from "@/lib/mail";

export type CateringFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Valeurs saisies, renvoyées en cas d’erreur pour ne pas vider le formulaire. */
  values?: Record<string, string>;
};

function field(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function sendCateringRequest(
  _previous: CateringFormState,
  formData: FormData,
): Promise<CateringFormState> {
  const lang = field(formData, "lang") === "en" ? "en" : "fr";
  const t = getDictionary(lang).catering.form;

  // Champ piège invisible : un humain le laisse vide, un robot le remplit.
  if (field(formData, "website")) {
    return { status: "success" };
  }

  const request = {
    name: field(formData, "name", 120),
    email: field(formData, "email", 160),
    phone: field(formData, "phone", 40),
    eventType: field(formData, "eventType", 60),
    date: field(formData, "date", 20),
    guests: field(formData, "guests", 10),
    location: field(formData, "location", 60),
    message: field(formData, "message", 4000),
  };

  const guests = Number(request.guests);
  if (
    !request.name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) ||
    !request.phone ||
    !eventTypes.some((type) => type.value === request.eventType) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(request.date) ||
    !Number.isInteger(guests) ||
    guests < 2 ||
    !eventLocations.some((location) => location.value === request.location) ||
    !request.message
  ) {
    return {
      status: "error",
      message: t.errorIncomplete,
      values: request,
    };
  }

  // Conservée dans l’admin d’abord : la demande n’est pas perdue même si le courriel échoue.
  let saved = false;
  try {
    await saveCateringRequest(await db(), {
      ...request,
      eventType: request.eventType,
      eventDate: request.date,
      guests,
      locale: lang,
    });
    saved = true;
  } catch (error) {
    console.error("[traiteur] Demande non enregistrée dans l’admin", error);
  }

  const to = process.env.CATERING_EMAIL_TO;
  if (!to || !mailConfigured()) {
    if (saved || process.env.NODE_ENV !== "production") {
      console.info(
        "[traiteur] Courriel non configuré, demande reçue :",
        request,
      );
      return { status: "success" };
    }
    console.error(
      "[traiteur] SMTP ou CATERING_EMAIL_TO non configuré : la demande n’a pas été envoyée.",
    );
    return { status: "error", message: t.errorSend, values: request };
  }

  const siteUrl = process.env.SITE_URL ?? "https://tsaktsak.com";

  const sent = await sendMail({
    to,
    replyTo: `${request.name} <${request.email}>`,
    subject: `Demande traiteur — ${request.eventType}, ${request.date} (${guests} pers.)${lang === "en" ? " — client anglophone" : ""}`,
    text: [
      `Nom : ${request.name}`,
      `Courriel : ${request.email}`,
      `Téléphone : ${request.phone}`,
      `Type d’événement : ${request.eventType}`,
      `Date souhaitée : ${request.date}`,
      `Nombre de personnes : ${guests}`,
      `Lieu : ${request.location}`,
      "",
      request.message,
    ].join("\n"),
    html: renderEmail({
      eyebrow: "Nouvelle demande",
      title: "Demande traiteur.",
      blocks: [
        {
          type: "rows",
          rows: [
            ["Nom", request.name],
            ["Courriel", request.email],
            ["Téléphone", request.phone],
            ["Événement", request.eventType],
            ["Date souhaitée", request.date],
            ["Personnes", String(guests)],
            ["Lieu", request.location],
          ],
        },
        { type: "note", text: request.message },
        {
          type: "button",
          label: "Voir dans l’admin",
          url: `${siteUrl}/admin/demandes`,
        },
      ],
      siteUrl,
    }),
  });

  if (!sent) {
    // Déjà enregistrée dans l’admin : le client n’a pas à renvoyer sa demande.
    return saved
      ? { status: "success" }
      : { status: "error", message: t.errorSend, values: request };
  }

  // Accusé de réception au client : un échec ici ne doit pas faire échouer la demande, déjà transmise.
  const firstName = request.name.split(" ")[0];
  const copy = confirmationText[lang];
  await sendMail({
    to: request.email,
    replyTo: to,
    subject: copy.subject,
    text: [
      `${copy.hello} ${firstName},`,
      "",
      copy.body,
      "",
      copy.recap,
      `- ${copy.event} : ${request.eventType}`,
      `- ${copy.date} : ${request.date}`,
      `- ${copy.guests} : ${guests}`,
      "",
      copy.bye,
    ].join("\n"),
    html: renderEmail({
      lang,
      siteUrl,
      preheader: copy.preheader,
      eyebrow: copy.eyebrow,
      title: copy.title,
      blocks: [
        { type: "p", text: `${copy.hello} ${firstName},\n\n${copy.body}` },
        {
          type: "rows",
          title: copy.recap.replace(/ ?:$/, ""),
          rows: [
            [copy.event, request.eventType],
            [copy.date, request.date],
            [copy.guests, String(guests)],
          ],
        },
        { type: "p", text: copy.bye },
      ],
    }),
  });

  return { status: "success" };
}

const confirmationText = {
  fr: {
    subject: "Nous avons bien reçu votre demande — Tsak Tsak",
    preheader: "Notre équipe communiquera avec vous sous peu.",
    eyebrow: "Traiteur",
    title: "Demande bien reçue.",
    hello: "Bonjour",
    body: "Merci de nous avoir écrit! Votre demande traiteur a bien été envoyée. Notre équipe communiquera avec vous sous peu pour discuter de votre événement.",
    recap: "Rappel de votre demande :",
    event: "Type d’événement",
    date: "Date souhaitée",
    guests: "Nombre de personnes",
    bye: "À bientôt,\nL’équipe Tsak Tsak\n514-495-7812",
  },
  en: {
    subject: "We received your request — Tsak Tsak",
    preheader: "Our team will get back to you shortly.",
    eyebrow: "Catering",
    title: "Request received.",
    hello: "Hello",
    body: "Thank you for reaching out! Your catering request has been sent. Our team will get back to you shortly to discuss your event.",
    recap: "Your request:",
    event: "Event type",
    date: "Preferred date",
    guests: "Number of guests",
    bye: "See you soon,\nThe Tsak Tsak team\n514-495-7812",
  },
};
