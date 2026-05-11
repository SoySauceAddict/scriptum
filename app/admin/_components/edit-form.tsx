"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateRecord } from "@/app/actions/admin";
import type { FieldDef } from "@/lib/admin-tables";

type Props = {
  table: string;
  id: string;
  fields: FieldDef[];
  record: Record<string, unknown>;
};

export function EditForm({ table, id, fields, record }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const editableFields = fields.filter((f) => f.editable);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    for (const field of editableFields) {
      data[field.key] = (formData.get(field.key) as string) ?? "";
    }
    startTransition(async () => {
      await adminUpdateRecord(table, id, data);
      router.push(`/admin/${table}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      {fields.map((field) => (
        <div key={field.key} className="edit-form__row">
          <label className="edit-form__label">{field.label}</label>
          {field.editable ? (
            <EditField field={field} value={record[field.key]} />
          ) : (
            <span className="edit-form__static">{formatValue(record[field.key])}</span>
          )}
        </div>
      ))}
      {editableFields.length > 0 && (
        <div className="edit-form__actions">
          <button type="submit" disabled={pending} className="btn btn--primary">
            {pending ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn">
            Zpět
          </button>
        </div>
      )}
    </form>
  );
}

function EditField({ field, value }: { field: FieldDef; value: unknown }) {
  const strValue = value === null || value === undefined ? "" : String(value);

  if (field.type === "textarea") {
    return <textarea name={field.key} defaultValue={strValue} rows={6} className="edit-form__input edit-form__input--textarea" />;
  }
  if (field.type === "select" || field.type === "boolean") {
    return (
      <select name={field.key} defaultValue={strValue} className="edit-form__input">
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  return <input type="text" name={field.key} defaultValue={strValue} className="edit-form__input" />;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (v instanceof Date) return v.toLocaleString("cs-CZ");
  if (typeof v === "boolean") return v ? "Ano" : "Ne";
  return String(v);
}
