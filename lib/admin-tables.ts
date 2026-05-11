import { prisma } from "@/lib/prisma";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "boolean";
  editable?: boolean;
  options?: { label: string; value: string }[];
};

export type TableDef = {
  label: string;
  fields: FieldDef[];
  fetch: () => Promise<Record<string, unknown>[]>;
  fetchOne: (id: string) => Promise<Record<string, unknown> | null>;
  update?: (id: string, data: Record<string, string>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const defs: Record<string, TableDef> = {
  users: {
    label: "Uživatelé",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "email", label: "Email", type: "text", editable: true },
      { key: "name", label: "Jméno", type: "text", editable: true },
      { key: "role", label: "Role", type: "select", editable: true, options: [{ label: "USER", value: "USER" }, { label: "ADMIN", value: "ADMIN" }] },
      { key: "createdAt", label: "Vytvořeno", type: "text" },
    ],
    fetch: async () => prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, name: true, role: true, createdAt: true } }) as Promise<Record<string, unknown>[]>,
    fetchOne: async (id) => prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, createdAt: true } }) as Promise<Record<string, unknown> | null>,
    update: async (id, data) => {
      await prisma.user.update({ where: { id }, data: { email: data.email, name: data.name, role: data.role as "USER" | "ADMIN" } });
    },
    remove: async (id) => { await prisma.user.delete({ where: { id } }); },
  },

  posts: {
    label: "Příspěvky",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "title", label: "Titulek", type: "text", editable: true },
      { key: "content", label: "Obsah", type: "textarea", editable: true },
      { key: "authorId", label: "Autor ID", type: "text" },
      { key: "authorEmail", label: "Autor email", type: "text" },
      { key: "createdAt", label: "Vytvořeno", type: "text" },
    ],
    fetch: async () => {
      const rows = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { email: true } } } });
      return rows.map((r) => ({ id: r.id, title: r.title, content: r.content, authorId: r.authorId, authorEmail: r.author.email, createdAt: r.createdAt }));
    },
    fetchOne: async (id) => {
      const r = await prisma.post.findUnique({ where: { id }, include: { author: { select: { email: true } } } });
      if (!r) return null;
      return { id: r.id, title: r.title, content: r.content, authorId: r.authorId, authorEmail: r.author.email, createdAt: r.createdAt };
    },
    update: async (id, data) => {
      await prisma.post.update({ where: { id }, data: { title: data.title, content: data.content } });
    },
    remove: async (id) => { await prisma.post.delete({ where: { id } }); },
  },

  comments: {
    label: "Komentáře",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "content", label: "Obsah", type: "textarea", editable: true },
      { key: "deleted", label: "Smazáno", type: "boolean", editable: true, options: [{ label: "Ano", value: "true" }, { label: "Ne", value: "false" }] },
      { key: "postId", label: "Post ID", type: "text" },
      { key: "parentId", label: "Rodič ID", type: "text" },
      { key: "authorId", label: "Autor ID", type: "text" },
      { key: "authorEmail", label: "Autor email", type: "text" },
      { key: "anonymousId", label: "Anon ID", type: "text" },
      { key: "anonymousNickname", label: "Anon nick", type: "text" },
      { key: "createdAt", label: "Vytvořeno", type: "text" },
    ],
    fetch: async () => {
      const rows = await prisma.comment.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { email: true } }, anonymous: { select: { nickname: true } } } });
      return rows.map((r) => ({ id: r.id, content: r.content, deleted: r.deleted, postId: r.postId, parentId: r.parentId, authorId: r.authorId, authorEmail: r.author?.email ?? null, anonymousId: r.anonymousId, anonymousNickname: r.anonymous?.nickname ?? null, createdAt: r.createdAt }));
    },
    fetchOne: async (id) => {
      const r = await prisma.comment.findUnique({ where: { id }, include: { author: { select: { email: true } }, anonymous: { select: { nickname: true } } } });
      if (!r) return null;
      return { id: r.id, content: r.content, deleted: r.deleted, postId: r.postId, parentId: r.parentId, authorId: r.authorId, authorEmail: r.author?.email ?? null, anonymousId: r.anonymousId, anonymousNickname: r.anonymous?.nickname ?? null, createdAt: r.createdAt };
    },
    update: async (id, data) => {
      await prisma.comment.update({ where: { id }, data: { content: data.content, deleted: data.deleted === "true" } });
    },
    remove: async (id) => { await prisma.comment.delete({ where: { id } }); },
  },

  anonymousUsers: {
    label: "Anonymní uživatelé",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "cookieId", label: "Cookie ID", type: "text" },
      { key: "nickname", label: "Přezdívka", type: "text", editable: true },
      { key: "createdAt", label: "Vytvořeno", type: "text" },
      { key: "updatedAt", label: "Upraveno", type: "text" },
    ],
    fetch: async () => prisma.anonymousUser.findMany({ orderBy: { createdAt: "desc" } }) as Promise<Record<string, unknown>[]>,
    fetchOne: async (id) => prisma.anonymousUser.findUnique({ where: { id } }) as Promise<Record<string, unknown> | null>,
    update: async (id, data) => {
      await prisma.anonymousUser.update({ where: { id }, data: { nickname: data.nickname } });
    },
    remove: async (id) => { await prisma.anonymousUser.delete({ where: { id } }); },
  },

  notifications: {
    label: "Notifikace",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "type", label: "Typ", type: "text" },
      { key: "message", label: "Zpráva", type: "text", editable: true },
      { key: "read", label: "Přečteno", type: "boolean", editable: true, options: [{ label: "Ano", value: "true" }, { label: "Ne", value: "false" }] },
      { key: "userId", label: "Uživatel ID", type: "text" },
      { key: "linkUrl", label: "URL", type: "text" },
      { key: "createdAt", label: "Vytvořeno", type: "text" },
    ],
    fetch: async () => prisma.notification.findMany({ orderBy: { createdAt: "desc" } }) as Promise<Record<string, unknown>[]>,
    fetchOne: async (id) => prisma.notification.findUnique({ where: { id } }) as Promise<Record<string, unknown> | null>,
    update: async (id, data) => {
      await prisma.notification.update({ where: { id }, data: { message: data.message, read: data.read === "true" } });
    },
    remove: async (id) => { await prisma.notification.delete({ where: { id } }); },
  },

  activityLogs: {
    label: "Activity log",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "action", label: "Akce", type: "text" },
      { key: "metadata", label: "Metadata", type: "text" },
      { key: "userId", label: "Uživatel ID", type: "text" },
      { key: "anonymousId", label: "Anon ID", type: "text" },
      { key: "targetType", label: "Cíl typ", type: "text" },
      { key: "targetId", label: "Cíl ID", type: "text" },
      { key: "createdAt", label: "Vytvořeno", type: "text" },
    ],
    fetch: async () => prisma.activityLog.findMany({ orderBy: { createdAt: "desc" } }) as Promise<Record<string, unknown>[]>,
    fetchOne: async (id) => prisma.activityLog.findUnique({ where: { id } }) as Promise<Record<string, unknown> | null>,
    remove: async (id) => { await prisma.activityLog.delete({ where: { id } }); },
  },
};

export const TABLE_DEFS = defs;
export const TABLES = Object.keys(defs) as TableKey[];
export type TableKey = keyof typeof defs;
export const TABLE_LABEL: Record<string, string> = Object.fromEntries(TABLES.map((k) => [k, defs[k].label]));

export async function fetchTable(table: TableKey): Promise<Record<string, unknown>[]> {
  return defs[table].fetch();
}
