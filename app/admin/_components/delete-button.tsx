"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteRecord } from "@/app/actions/admin";

export function DeleteButton({ table, id }: { table: string; id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!confirm("Opravdu smazat tento záznam?")) return;
    startTransition(async () => {
      await adminDeleteRecord(table, id);
      router.push(`/admin/${table}`);
      router.refresh();
    });
  }

  return (
    <button onClick={handleClick} disabled={pending} className="btn btn--danger btn--sm">
      {pending ? "..." : "Smazat"}
    </button>
  );
}
