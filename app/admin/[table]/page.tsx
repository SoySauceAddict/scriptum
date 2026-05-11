import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTable, TABLE_DEFS, TABLES, type TableKey } from "@/lib/admin-tables";
import { DeleteButton } from "@/app/admin/_components/delete-button";

export default async function AdminTablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  if (!TABLES.includes(table as TableKey)) notFound();

  const key = table as TableKey;
  const def = TABLE_DEFS[key];
  const rows = await fetchTable(key);
  const hasEditableFields = def.fields.some((f) => f.editable);

  const columns =
    rows.length > 0
      ? Array.from(
          rows.reduce<Set<string>>((set, r) => {
            Object.keys(r).forEach((k) => set.add(k));
            return set;
          }, new Set())
        )
      : def.fields.map((f) => f.key);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>{def.label}</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            {rows.length} záznamů
          </p>
        </div>
        <a href={`/api/admin/export?table=${key}`} className="btn btn--primary">
          ↓ Export CSV
        </a>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">Žádná data.</div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c} title={formatCell(r[c])}>
                      {formatCell(r[c])}
                    </td>
                  ))}
                  <td style={{ whiteSpace: "nowrap", display: "flex", gap: 6 }}>
                    {hasEditableFields && (
                      <Link href={`/admin/${key}/${r.id}`} className="btn btn--sm">
                        Upravit
                      </Link>
                    )}
                    <DeleteButton table={key} id={String(r.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (v instanceof Date) return v.toLocaleString("cs-CZ");
  if (typeof v === "boolean") return v ? "Ano" : "Ne";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
