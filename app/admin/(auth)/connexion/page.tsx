import type { Metadata } from "next";

import { login } from "@/app/admin/actions";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { Logo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <Logo />
        <p className="eyebrow">Administration</p>
        <h1>Connexion</h1>
        <ActionForm action={login} className="admin-form admin-form--single">
          <label className="field">
            <span>Courriel</span>
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label className="field">
            <span>Mot de passe</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <SubmitButton pendingLabel="Connexion…">
            Se connecter <span aria-hidden="true">↗</span>
          </SubmitButton>
        </ActionForm>
      </div>
    </main>
  );
}
