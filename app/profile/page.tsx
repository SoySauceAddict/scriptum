import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NotificationsBell } from "@/app/_components/notifications-bell";
import { logoutAction } from "@/app/actions/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  const [posts, comments] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true } } },
    }),
    prisma.comment.findMany({
      where: { authorId: user.id, deleted: false },
      orderBy: { createdAt: "desc" },
      include: { post: { select: { id: true, title: true } } },
      take: 50,
    }),
  ]);

  return (
    <>
      <header className="app-header">
        <div className="container app-header__inner">
          <Link href="/" className="logo">Scriptum</Link>
          <nav className="app-nav">
            <NotificationsBell />
            <span className="nav-user">{user.name ?? user.email}</span>
            <Link href="/" className="nav-link">Zpět</Link>
            <form action={logoutAction}>
              <button type="submit" className="nav-link">Odhlásit</button>
            </form>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{user.name ?? user.email}</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              {user.email} · členem od {new Date(user.createdAt).toLocaleDateString("cs-CZ")}
            </p>
          </div>

          <h2 className="muted-title">Tvoje příspěvky ({posts.length})</h2>
          {posts.length === 0 ? (
            <div className="empty-state">Zatím jsi nic nenapsal.</div>
          ) : (
            <ul className="list">
              {posts.map((p) => (
                <li key={p.id} className="room-card">
                  <Link href={`/posts/${p.id}`} className="room-card__link">
                    <div className="room-card__title">{p.title}</div>
                    <div className="room-card__meta">
                      {p._count.comments} komentářů ·{" "}
                      {new Date(p.createdAt).toLocaleString("cs-CZ")}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h2 className="muted-title">Tvoje komentáře ({comments.length})</h2>
          {comments.length === 0 ? (
            <div className="empty-state">Zatím jsi nic nekomentoval.</div>
          ) : (
            <ul className="list">
              {comments.map((c) => (
                <li key={c.id} className="comment-item">
                  <div className="comment-body">{c.content}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    pod{" "}
                    <Link href={`/posts/${c.post.id}#c-${c.id}`}>{c.post.title}</Link>
                    {" · "}
                    {new Date(c.createdAt).toLocaleString("cs-CZ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
