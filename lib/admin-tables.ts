import { prisma } from "@/lib/prisma";

export const TABLES = ["users", "posts", "comments", "anonymousUsers", "notifications", "activityLogs"] as const;
export type TableKey = (typeof TABLES)[number];

export const TABLE_LABEL: Record<TableKey, string> = {
  users: "Uživatelé",
  posts: "Příspěvky",
  comments: "Komentáře",
  anonymousUsers: "Anonymní uživatelé",
  notifications: "Notifikace",
  activityLogs: "Activity log",
};

export async function fetchTable(table: TableKey): Promise<Record<string, unknown>[]> {
  switch (table) {
    case "users":
      return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
    case "posts":
      return prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true } } },
      }).then((rows) => rows.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        authorId: r.authorId,
        authorEmail: r.author.email,
        createdAt: r.createdAt,
      })));
    case "comments":
      return prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { email: true } },
          anonymous: { select: { nickname: true } },
        },
      }).then((rows) => rows.map((r) => ({
        id: r.id,
        content: r.content,
        postId: r.postId,
        parentId: r.parentId,
        authorId: r.authorId,
        authorEmail: r.author?.email ?? null,
        anonymousId: r.anonymousId,
        anonymousNickname: r.anonymous?.nickname ?? null,
        createdAt: r.createdAt,
      })));
    case "anonymousUsers":
      return prisma.anonymousUser.findMany({ orderBy: { createdAt: "desc" } });
    case "notifications":
      return prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
    case "activityLogs":
      return prisma.activityLog.findMany({ orderBy: { createdAt: "desc" } });
  }
}
