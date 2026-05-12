"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setNicknameAction, type AnonState } from "@/app/actions/anonymous";

export function NicknameModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, action, pending] = useActionState<AnonState, FormData>(setNicknameAction, undefined);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("scriptum:open-nickname-modal", handler);
    return () => window.removeEventListener("scriptum:open-nickname-modal", handler);
  }, []);

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Nastav si přezdívku</h2>
        <p className="modal__desc">Před psaním komentářů si zvol přezdívku.</p>
        <form action={action} className="modal__form">
          <input
            name="nickname"
            placeholder="Tvoje přezdívka"
            required
            minLength={2}
            maxLength={30}
            className="field"
            autoFocus
          />
          {state?.error && <p className="form-error" style={{ margin: 0 }}>{state.error}</p>}
          <div className="modal__actions">
            <button type="submit" disabled={pending} className="btn btn--primary">
              {pending ? "…" : "Nastavit"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn">
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function openNicknameModal() {
  window.dispatchEvent(new Event("scriptum:open-nickname-modal"));
}
