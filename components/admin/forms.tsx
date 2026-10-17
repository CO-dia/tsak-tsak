"use client";

import {
  createContext,
  startTransition,
  use,
  useActionState,
  useEffect,
  useRef,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/app/admin/actions";

/** État « envoi en cours » des formulaires ActionForm (qui n’utilisent pas l’attribut action). */
const PendingContext = createContext(false);

function usePending() {
  const { pending } = useFormStatus();
  return use(PendingContext) || pending;
}

const noop = () => () => {};

/**
 * Vrai une fois la page interactive. Les boutons restent désactivés avant : l’admin a besoin
 * du JavaScript, et cela évite tout envoi du formulaire avant le chargement de la page.
 */
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  className = "button button--dark",
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const pending = usePending();
  const hydrated = useHydrated();
  return (
    <button className={className} type="submit" disabled={pending || !hydrated}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Bouton qui demande une confirmation avant d’envoyer le formulaire. */
export function ConfirmButton({
  children,
  message,
  className = "button button--danger button--small",
}: {
  children: ReactNode;
  message: string;
  className?: string;
}) {
  const pending = usePending();
  const hydrated = useHydrated();
  return (
    <button
      className={className}
      type="submit"
      disabled={pending || !hydrated}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? "Un instant…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p className="notice notice--error" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="notice" role="status">
        {state.success}
      </p>
    );
  }
  return null;
}

/**
 * Formulaire relié à une action qui retourne un message (erreur ou succès).
 * Les champs gardent leur saisie en cas d’erreur ; `resetOnSuccess` les vide après un succès.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.success) form.current?.reset();
  }, [state, resetOnSuccess]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    // Envoi géré par `onSubmit` (la saisie est conservée en cas d’erreur). `method="post"` garantit
    // qu’aucune donnée ne finit dans l’adresse de la page, même dans un cas imprévu.
    <form ref={form} method="post" onSubmit={submit} className={className} aria-busy={pending}>
      <PendingContext value={pending}>{children}</PendingContext>
      <FormMessage state={state} />
    </form>
  );
}
