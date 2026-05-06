import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { getAnonymousUser } from "@/lib/anonymous";
import { logoutAction } from "@/app/actions/auth";
import { NicknameForm } from "@/app/_components/nickname-form";
import { PostList } from "@/app/_components/post-list";
import { NotificationsBell } from "@/app/_components/notifications-bell";

export default async function Home() {
  const user = await getCurrentUser();
  const anon = user ? null : await getAnonymousUser();

  return (
    <>
      <header className="app-header" style={{ position: 'relative' }}>
        <div className="container app-header__inner">
          <Link href="/" className="logo">Scriptum</Link>
          <nav className="app-nav">
            {user ? (
              <>
                <NotificationsBell />
                <Link href="/profile" className="nav-user">
                  {user.name ?? user.email}
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="nav-link">Odhlásit</button>
                </form>
              </>
            ) : (
              <>
                <NicknameForm current={anon?.nickname ?? null} />
                <Link href="/login" className="nav-link">Přihlásit</Link>
                <Link href="/register" className="btn btn--primary btn--small">Registrace</Link>
              </>
            )}
          </nav>
        </div>
        {user && user.role === "ADMIN" && (
          <Link href="/admin" className="nav-link" style={{ position: 'absolute', right: '20px', top: '15px' }}>na admin panel →</Link>
        )}
      </header>

      <main className="main">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h1 className="page-title" style={{ margin: 0 }}>Příspěvky</h1>
            {user && (
              <Link href="/posts/new" className="btn btn--primary">+ Nový příspěvek</Link>
            )}
          </div>

          <PostList />
        </div>
      </main>
    </>
  );
}
