import { notFound } from "next/navigation";
import { TABLE_DEFS, TABLES, type TableKey } from "@/lib/admin-tables";
import { EditForm } from "@/app/admin/_components/edit-form";
import { DeleteButton } from "@/app/admin/_components/delete-button";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ table: string; id: string }>;
}) {
  const { table, id } = await params;
  if (!TABLES.includes(table as TableKey)) notFound();

  const def = TABLE_DEFS[table as TableKey];
  const record = await def.fetchOne(id);
  if (!record) notFound();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>
            {def.label} — detail
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{id}</p>
        </div>
        <DeleteButton table={table} id={id} />
      </div>
      <EditForm table={table} id={id} fields={def.fields} record={record} />
    </div>
  );
}
