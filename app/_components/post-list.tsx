import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

export async function PostList() {
  const user = await getCurrentUser();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
    take: 50,
  });

  if (posts.length === 0) {
    return <div className="empty-state">Zatím tu nic není. Buď první!</div>;
  }

  return (
    <ul className="list">
      {posts.map((p) => {
        const isMine = !!user && p.authorId === user.id;
        return (
          <li key={p.id} className={`room-card${isMine ? " room-card--mine" : ""}`}>
            <Link href={`/posts/${p.id}`} className="room-card__link">
              <div className="room-card__title">
                {p.title}
                {isMine && <span className="room-mine-badge">ty</span>}
              </div>
              <div className="room-card__meta">
                Vytvořil: {p.author.name ?? p.author.email} ·{" "}
                {new Date(p.createdAt).toLocaleString("cs-CZ")} ·{" "}
                {p._count.comments} {pluralize(p._count.comments, ["komentář", "komentáře", "komentářů"])}
              </div>
              <div className="room-card__body">{p.content}</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function pluralize(n: number, [one, few, many]: [string, string, string]) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}
