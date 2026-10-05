"use client";

import { useEffect, useState } from "react";

export default function CateringModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button className="btn" type="button" onClick={() => setOpen(true)}>
        FAIRE UNE DEMANDE →
      </button>

      <div
        className={`modal${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="box">
          <button className="close" aria-label="Fermer" onClick={() => setOpen(false)}>×</button>
          <h3>Demande traiteur</h3>
          <p>Remplissez les informations essentielles, nous vous répondons rapidement.</p>
          <form action="https://formsubmit.co/restotsaktsak@gmail.com" method="POST">
            <input type="hidden" name="_subject" value="Nouvelle demande traiteur — Tsak Tsak" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="true" />
            <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
            <label>Nom *<input type="text" name="Nom" required /></label>
            <label>Courriel *<input type="email" name="Courriel" required /></label>
            <label>Téléphone *<input type="tel" name="Téléphone" required /></label>
            <label>
              Type d&apos;événement *
              <select name="Type d'événement" required defaultValue="">
                <option value="">Choisir…</option>
                <option>Anniversaire</option>
                <option>Baby shower</option>
                <option>Mariage</option>
                <option>Événement corporatif</option>
                <option>Réception privée</option>
                <option>Autre</option>
              </select>
            </label>
            <label>Date souhaitée *<input type="date" name="Date souhaitée" required /></label>
            <label>Nombre de personnes *<input type="number" min={1} name="Nombre de personnes" required /></label>
            <label className="full">
              Lieu de l&apos;événement *
              <select name="Lieu" required defaultValue="">
                <option value="">Choisir…</option>
                <option>Dans un restaurant Tsak Tsak</option>
                <option>À l&apos;extérieur</option>
              </select>
            </label>
            <label className="full">
              Salle souhaitée (si applicable)
              <select name="Salle souhaitée" defaultValue="">
                <option value="">Aucune / à déterminer</option>
                <option>Beaubien — Salle 1 (30 à 40 personnes)</option>
                <option>Beaubien — Salle 2 (60 personnes)</option>
                <option>Saint-Laurent — Salle privée (60 personnes)</option>
              </select>
            </label>
            <label className="full">Adresse de l&apos;événement (si à l&apos;extérieur)<input type="text" name="Adresse extérieure" /></label>
            <label className="full">Budget approximatif (facultatif)<input type="text" name="Budget" placeholder="ex. 1 500 $" /></label>
            <label className="full">Besoins particuliers / détails de l&apos;événement<textarea name="Besoins particuliers" /></label>
            <label className="full">Message<textarea name="Message" /></label>
            <div className="full"><button className="btn" type="submit">ENVOYER MA DEMANDE →</button></div>
          </form>
        </div>
      </div>
    </>
  );
}
