"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, undefined);

  return (
    <form action={action} className="form-card">
      <h1 className="form-card__title">Přihlášení</h1>
      <p className="form-card__subtitle">Vítej zpátky.</p>

      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="field" />
        {state?.errors?.email && <p className="form-error">{state.errors.email[0]}</p>}
      </div>

      <div className="form-row">
        <label htmlFor="password">Heslo</label>
        <input id="password" name="password" type="password" required className="field" />
        {state?.errors?.password && <p className="form-error">{state.errors.password[0]}</p>}
      </div>

      {state?.message && <p className="form-error--block form-error">{state.message}</p>}

      <div className="form-actions">
        <button type="submit" disabled={pending} className="btn btn--primary" style={{ flex: 1 }}>
          {pending ? "Přihlašuji…" : "Přihlásit se"}
        </button>
      </div>

      <p className="form-card__footer">
        Nemáš účet? <Link href="/register">Zaregistruj se</Link>
      </p>
    </form>
  );
}
