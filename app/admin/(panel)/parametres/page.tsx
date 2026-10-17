import type { Metadata } from "next";
import { Suspense } from "react";

import { saveSettings } from "@/app/admin/actions";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AdminHeader, AdminLoading } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { shopInbox } from "@/lib/mail";
import { centsToInput } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <>
      <AdminHeader eyebrow="Épicerie" title="Paramètres" />
      <Suspense fallback={<AdminLoading />}>
        <SettingsForm />
      </Suspense>
    </>
  );
}

async function SettingsForm() {
  await requireAdmin();
  const sql = await db();
  const settings = await getSettings(sql);

  return (
    <ActionForm action={saveSettings} className="admin-card admin-form">
      <div className="form-section">
        <h2>Boutique</h2>
        <p>Fermez la boutique pour suspendre les commandes sans retirer les produits.</p>
      </div>
      <label className="toggle field--wide">
        <input type="checkbox" name="shopOpen" defaultChecked={settings.shopOpen} />
        <span>
          <strong>La boutique accepte les commandes</strong>
          <small>Si elle est fermée, les produits restent visibles mais ne peuvent pas être achetés.</small>
        </span>
      </label>
      <label className="field">
        <span>Message quand la boutique est fermée</span>
        <textarea name="closedMessage" defaultValue={settings.closedMessage} rows={2} maxLength={300} />
      </label>
      <label className="field">
        <span>Même message en anglais</span>
        <textarea name="closedMessageEn" defaultValue={settings.closedMessageEn} rows={2} maxLength={300} lang="en" />
        <p className="field__hint">Affiché sur la version anglaise du site.</p>
      </label>

      <div className="form-section">
        <h2>Ramassage</h2>
        <p>Au Tsak Tsak Beaubien ou au Tsak Tsak Saint-Laurent, au choix du client.</p>
      </div>
      <label className="toggle field--wide">
        <input type="checkbox" name="pickupEnabled" defaultChecked={settings.pickupEnabled} />
        <span>
          <strong>Offrir le ramassage au restaurant</strong>
        </span>
      </label>
      <label className="field">
        <span>Instructions de ramassage</span>
        <textarea name="pickupInstructions" defaultValue={settings.pickupInstructions} rows={3} maxLength={600} />
        <p className="field__hint">Affichées au client avant le paiement et dans son courriel de confirmation.</p>
      </label>
      <label className="field">
        <span>En anglais</span>
        <textarea
          name="pickupInstructionsEn"
          defaultValue={settings.pickupInstructionsEn}
          rows={3}
          maxLength={600}
          lang="en"
        />
        <p className="field__hint">Pour les clients qui commandent sur la version anglaise.</p>
      </label>

      <div className="form-section">
        <h2>Livraison</h2>
        <p>
          Le client indique son adresse de livraison ; votre équipe organise la livraison et le
          contacte au besoin.
        </p>
      </div>
      <label className="toggle field--wide">
        <input type="checkbox" name="deliveryEnabled" defaultChecked={settings.deliveryEnabled} />
        <span>
          <strong>Offrir la livraison</strong>
        </span>
      </label>
      <label className="field">
        <span>Frais de livraison ($)</span>
        <input
          name="deliveryFee"
          type="text"
          inputMode="decimal"
          defaultValue={centsToInput(settings.deliveryFeeCents)}
        />
        <p className="field__hint">0 = livraison sans frais.</p>
      </label>
      <label className="field">
        <span>Informations sur la livraison</span>
        <textarea
          name="deliveryInstructions"
          defaultValue={settings.deliveryInstructions}
          rows={3}
          maxLength={600}
        />
        <p className="field__hint">Par exemple la zone desservie et les délais.</p>
      </label>
      <label className="field">
        <span>En anglais</span>
        <textarea
          name="deliveryInstructionsEn"
          defaultValue={settings.deliveryInstructionsEn}
          rows={3}
          maxLength={600}
          lang="en"
        />
        <p className="field__hint">Pour les clients qui commandent sur la version anglaise.</p>
      </label>

      <div className="form-section">
        <h2>Taxes</h2>
        <p>
          À activer si vous êtes inscrits à la TPS et à la TVQ. Seuls les produits marqués
          « taxables » sont taxés (les aliments de base sont généralement détaxés) ; les frais de
          livraison sont alors aussi taxés. Validez ces choix avec votre comptable.
        </p>
      </div>
      <label className="toggle field--wide">
        <input type="checkbox" name="taxesEnabled" defaultChecked={settings.taxesEnabled} />
        <span>
          <strong>Percevoir la TPS (5 %) et la TVQ (9,975 %)</strong>
        </span>
      </label>
      <label className="field">
        <span>Numéro de TPS</span>
        <input name="gstNumber" type="text" defaultValue={settings.gstNumber} maxLength={40} />
      </label>
      <label className="field">
        <span>Numéro de TVQ</span>
        <input name="qstNumber" type="text" defaultValue={settings.qstNumber} maxLength={40} />
      </label>

      <div className="form-section">
        <h2>Avis de commande</h2>
        <p>Un courriel est envoyé à cette adresse pour chaque nouvelle commande payée.</p>
      </div>
      <label className="field field--wide">
        <span>Courriel de l’équipe</span>
        <input
          name="notificationEmail"
          type="email"
          defaultValue={settings.notificationEmail}
          placeholder={shopInbox() || "resto@tsaktsak.com"}
        />
      </label>

      <div className="form-footer">
        <SubmitButton>Enregistrer les paramètres</SubmitButton>
      </div>
    </ActionForm>
  );
}
