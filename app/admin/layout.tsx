import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { TABLES, TABLE_LABEL } from "@/lib/admin-tables";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/" className="logo" style={{ marginBottom: 18 }}><img src="/logo.svg" alt="Scriptum" style={{ height: "34px", width: "auto", display: "block" }} /></Link>
        <Link href="/" className="nav-link">← na web</Link>
        <h3>Admin</h3>
        <Link href="/admin" className="nav-link">Přehled</Link>
        {TABLES.map((t) => (
          <Link key={t} href={`/admin/${t}`} className="nav-link">
            {TABLE_LABEL[t]}
          </Link>
        ))}
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
