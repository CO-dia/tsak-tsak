import type { Metadata } from "next";
import { Suspense } from "react";

import { changePassword, createAdmin, deleteAdmin } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { AdminHeader, AdminLoading, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Compte" };

export default function AccountPage() {
  return (
    <>
      <AdminHeader eyebrow="Administration" title="Compte" />
      <Suspense fallback={<AdminLoading />}>
        <Account />
      </Suspense>
    </>
  );
}

async function Account() {
  const admin = await requireAdmin();
  const sql = await db();
  const users = await sql<{ id: string; email: string; name: string; lastLoginAt: Date | null }[]>`
    select id, email, name, last_login_at from admin_users order by created_at
  `;

  return (
    <div className="admin-columns">
      <div>
        <section className="admin-card">
          <h2>Personnes ayant accès</h2>
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Courriel</th>
                  <th>Dernière connexion</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.email}
                      {user.name && <span className="muted"> · {user.name}</span>}
                    </td>
                    <td className="muted">{formatDate(user.lastLoginAt)}</td>
                    <td className="num">
                      {user.id === admin.id ? (
                        <span className="muted">Vous</span>
                      ) : (
                        <form action={deleteAdmin}>
                          <input type="hidden" name="id" value={user.id} />
                          <ConfirmButton className="link-button link-button--danger" message={`Retirer l’accès de ${user.email} ?`}>
                            Retirer
                          </ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-card">
          <h2>Ajouter une personne</h2>
          <ActionForm action={createAdmin} className="admin-form" resetOnSuccess>
            <label className="field">
              <span>Courriel</span>
              <input name="email" type="email" required autoComplete="off" />
            </label>
            <label className="field">
              <span>Nom</span>
              <input name="name" type="text" autoComplete="off" />
            </label>
            <label className="field field--wide">
              <span>Mot de passe temporaire</span>
              <input name="password" type="text" minLength={10} required autoComplete="off" />
              <p className="field__hint">
                Au moins 10 caractères. Transmettez-le à la personne de façon sécuritaire ; elle
                pourra le changer dans cette page.
              </p>
            </label>
            <div className="form-footer">
              <SubmitButton className="button button--ghost">Donner l’accès</SubmitButton>
            </div>
          </ActionForm>
        </section>
      </div>

      <section className="admin-card">
        <h2>Changer mon mot de passe</h2>
        <ActionForm action={changePassword} className="admin-form admin-form--single" resetOnSuccess>
          <label className="field">
            <span>Mot de passe actuel</span>
            <input name="current" type="password" autoComplete="current-password" required />
          </label>
          <label className="field">
            <span>Nouveau mot de passe</span>
            <input name="next" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          <label className="field">
            <span>Confirmer le nouveau mot de passe</span>
            <input name="confirm" type="password" autoComplete="new-password" minLength={10} required />
          </label>
          <div className="form-footer">
            <SubmitButton>Changer le mot de passe</SubmitButton>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
