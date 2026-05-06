import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [users, posts, comments, anons, notifications, logs] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.anonymousUser.count(),
    prisma.notification.count(),
    prisma.activityLog.count(),
  ]);

  const stats = [
    { label: "Uživatelé", value: users },
    { label: "Příspěvky", value: posts },
    { label: "Komentáře", value: comments },
    { label: "Anonymové", value: anons },
    { label: "Notifikace", value: notifications },
    { label: "Activity log", value: logs },
  ];

  return (
    <div>
      <h1 className="page-title">Přehled</h1>
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__value">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
