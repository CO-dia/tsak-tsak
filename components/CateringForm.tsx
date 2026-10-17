"use client";

import { useActionState, useState } from "react";

import { sendCateringRequest, type CateringFormState } from "@/app/[lang]/traiteur/actions";
import { Arrow } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type Option = { value: string; label: string };

type Props = {
  lang: Locale;
  labels: Dictionary["catering"]["form"];
  eventTypes: Option[];
  eventLocations: Option[];
};

const initialState: CateringFormState = { status: "idle" };

export default function CateringForm(props: Props) {
  // Changer la clé remonte le formulaire et remet son état à zéro (« Faire une autre demande »).
  const [formKey, setFormKey] = useState(0);
  return <RequestForm key={formKey} {...props} onReset={() => setFormKey((key) => key + 1)} />;
}

function RequestForm({ lang, labels: t, eventTypes, eventLocations, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendCateringRequest, initialState);
  const value = (name: string) => state.values?.[name] ?? "";

  if (state.status === "success") {
    return (
      <div className="form-success" role="status">
        <p className="eyebrow">{t.successEyebrow}</p>
        <h3>{t.successTitle}</h3>
        <p>{t.successText}</p>
        <button className="button button--dark" type="button" onClick={onReset}>
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form className="event-form" action={formAction}>
      <input type="hidden" name="lang" value={lang} />
      <label>
        <span>{t.name}</span>
        <input name="name" defaultValue={value("name")} type="text" placeholder={t.namePlaceholder} autoComplete="name" required />
      </label>
      <label>
        <span>{t.email}</span>
        <input
          name="email"
          defaultValue={value("email")}
          type="email"
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          required
        />
      </label>
      <label>
        <span>{t.phone}</span>
        <input name="phone" defaultValue={value("phone")} type="tel" placeholder="514 000-0000" autoComplete="tel" required />
      </label>
      <label>
        <span>{t.eventType}</span>
        <select name="eventType" defaultValue={value("eventType")} required>
          <option value="" disabled>
            {t.chooseOption}
          </option>
          {eventTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t.date}</span>
        <input name="date" defaultValue={value("date")} type="date" required />
      </label>
      <label>
        <span>{t.guests}</span>
        <input name="guests" defaultValue={value("guests")} type="number" min="2" placeholder={t.guestsPlaceholder} required />
      </label>
      <label className="event-form__wide">
        <span>{t.location}</span>
        <select name="location" defaultValue={value("location")} required>
          <option value="" disabled>
            {t.chooseLocation}
          </option>
          {eventLocations.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="event-form__wide">
        <span>{t.message}</span>
        <textarea name="message" defaultValue={value("message")} rows={6} placeholder={t.messagePlaceholder} required />
      </label>
      <div className="event-form__trap" aria-hidden="true">
        <label>
          {t.trap}
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="event-form__footer event-form__wide">
        {state.status === "error" && (
          <p className="event-form__error" role="alert">
            {state.message}
          </p>
        )}
        <button className="button button--dark" type="submit" disabled={pending}>
          {pending ? t.sending : t.submit} <Arrow />
        </button>
        <p>{t.consent}</p>
      </div>
    </form>
  );
}
