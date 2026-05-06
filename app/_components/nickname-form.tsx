"use client";

import { useActionState, useState } from "react";
import { setNicknameAction, type AnonState } from "@/app/actions/anonymous";

export function NicknameForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState<AnonState, FormData>(setNicknameAction, undefined);
  const [editing, setEditing] = useState(!current);

  if (current && !editing) {
    return (
      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
        jako <strong style={{ color: "var(--text)" }}>{current}</strong>{" "}
        <button onClick={() => setEditing(true)} className="nav-link" style={{ padding: "2px 6px" }}>
          změnit
        </button>
      </span>
    );
  }

  return (
    <form action={action} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input
        name="nickname"
        defaultValue={current ?? ""}
        placeholder="Přezdívka"
        required
        minLength={2}
        maxLength={30}
        className="field"
        style={{ width: 140, padding: "6px 10px" }}
      />
      <button type="submit" disabled={pending} className="btn btn--primary btn--small">
        {pending ? "…" : current ? "Uložit" : "Nastavit"}
      </button>
      {current && (
        <button type="button" onClick={() => setEditing(false)} className="nav-link">
          zrušit
        </button>
      )}
      {state?.error && <span style={{ color: "var(--danger)", fontSize: 12 }}>{state.error}</span>}
    </form>
  );
}
