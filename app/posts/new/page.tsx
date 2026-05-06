import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { NewPostForm } from "./new-post-form";
import { logoutAction } from "@/app/actions/auth";
import { NotificationsBell } from "@/app/_components/notifications-bell";

export default async function NewPostPage() {
  const user = await requireUser();

  return (
    <>
      <header className="app-header">
        <div className="container app-header__inner">
          <Link href="/" className="logo">Scriptum</Link>
          <nav className="app-nav">
            <NotificationsBell />
            <Link href="/profile" className="nav-user">{user.name ?? user.email}</Link>
            <form action={logoutAction}>
              <button type="submit" className="nav-link">Odhlásit</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <Link href="/" className="nav-link" style={{ paddingLeft: 0, marginBottom: 12, display: "inline-block" }}>
            ← zpět
          </Link>
          <NewPostForm />
        </div>
      </main>
    </>
  );
}
