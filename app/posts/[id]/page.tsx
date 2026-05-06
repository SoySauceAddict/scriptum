import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { getAnonymousUser } from "@/lib/anonymous";
import { CommentsSection } from "./comments-section";
import { PostView } from "./post-view";
import { NotificationsBell } from "@/app/_components/notifications-bell";
import { logoutAction } from "@/app/actions/auth";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  const anon = user ? null : await getAnonymousUser();
  const identity = user
    ? { type: "user" as const, id: user.id, label: user.name ?? user.email }
    : anon
      ? { type: "anonymous" as const, id: anon.id, label: anon.nickname }
      : { type: "guest" as const };

  const canEdit = !!user && user.id === post.authorId;
  const canDelete = !!user && (user.id === post.authorId || user.role === "ADMIN");
  const isMine = !!user && user.id === post.authorId;

  return (
    <>
      <header className="app-header">
        <div className="container app-header__inner">
          <Link href="/" className="logo">Scriptum</Link>
          <nav className="app-nav">
            {user ? (
              <>
                <NotificationsBell />
                <Link href="/profile" className="nav-user">{user.name ?? user.email}</Link>
                {user.role === "ADMIN" && <Link href="/admin" className="nav-link">na admin panel →</Link>}
                <form action={logoutAction}>
                  <button type="submit" className="nav-link">Odhlásit</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">Přihlásit</Link>
                <Link href="/register" className="btn btn--primary btn--small">Registrace</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Link href="/" className="nav-link" style={{ paddingLeft: 0, marginBottom: 12, display: "inline-block" }}>
            ← zpět
          </Link>

          <PostView
            post={{
              id: post.id,
              title: post.title,
              content: post.content,
              createdAt: post.createdAt.toISOString(),
              author: post.author,
            }}
            identity={identity}
            isMine={isMine}
            canEdit={canEdit}
            canDelete={canDelete}
          />

          <h2 className="muted-title">Ostatní komentáře</h2>

          <div className="comments-panel">
            <CommentsSection postId={post.id} identity={identity} />
          </div>
        </div>
      </main>
    </>
  );
}
