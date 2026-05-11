"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { TABLE_DEFS, type TableKey } from "@/lib/admin-tables";

export async function adminUpdateRecord(table: string, id: string, data: Record<string, string>) {
  await requireAdmin();
  const def = TABLE_DEFS[table as TableKey];
  if (!def?.update) throw new Error("Editace není povolena");
  await def.update(id, data);
  revalidatePath(`/admin/${table}`);
  revalidatePath(`/admin/${table}/${id}`);
}

export async function adminDeleteRecord(table: string, id: string) {
  await requireAdmin();
  const def = TABLE_DEFS[table as TableKey];
  if (!def) throw new Error("Neznámá tabulka");
  await def.remove(id);
  revalidatePath(`/admin/${table}`);
}
