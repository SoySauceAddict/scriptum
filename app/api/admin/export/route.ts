import { requireAdmin } from "@/lib/dal";
import { toCSV } from "@/lib/csv";
import { fetchTable, TABLES, type TableKey } from "@/lib/admin-tables";

export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const table = url.searchParams.get("table") as TableKey | null;
  if (!table || !TABLES.includes(table)) {
    return Response.json({ error: "Neplatná tabulka." }, { status: 400 });
  }
  const rows = await fetchTable(table);
  const csv = toCSV(rows as Record<string, unknown>[]);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${table}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
