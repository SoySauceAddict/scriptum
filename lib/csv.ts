export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";

  const keys = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (v instanceof Date) return v.toISOString();
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = keys.join(",");
  const lines = rows.map((r) => keys.map((k) => escape(r[k])).join(","));
  return [header, ...lines].join("\n");
}
