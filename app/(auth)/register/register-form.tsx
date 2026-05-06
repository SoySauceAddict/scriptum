"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "@/app/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, undefined);

  return (
    <form action={action} className="form-card">
      <h1 className="form-card__title">Registrace</h1>
      <p className="form-card__subtitle">Vytvoř si účet.</p>

      <div className="form-row">
        <label htmlFor="name">Jméno</label>
        <input id="name" name="name" type="text" required className="field" />
        {state?.errors?.name && <p className="form-error">{state.errors.name[0]}</p>}
      </div>

      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="field" />
        {state?.errors?.email && <p className="form-error">{state.errors.email[0]}</p>}
      </div>

      <div className="form-row">
        <label htmlFor="password">Heslo</label>
        <input id="password" name="password" type="password" required className="field" />
        <p className="hint">Min. 8 znaků</p>
        {state?.errors?.password && <p className="form-error">{state.errors.password[0]}</p>}
      </div>

      {state?.message && <p className="form-error--block form-error">{state.message}</p>}

      <div className="form-actions">
        <button type="submit" disabled={pending} className="btn btn--primary" style={{ flex: 1 }}>
          {pending ? "Registruji…" : "Zaregistrovat"}
        </button>
      </div>

      <p className="form-card__footer">
        Už máš účet? <Link href="/login">Přihlas se</Link>
      </p>
    </form>
  );
}
