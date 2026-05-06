import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const ANON_COOKIE = "scriptum_anon_id";
const ANON_TTL_DAYS = 365;

export async function getAnonymousUser() {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(ANON_COOKIE)?.value;
  if (!cookieId) return null;

  return prisma.anonymousUser.findUnique({ where: { cookieId } });
}

export async function ensureAnonymousUser(nickname: string) {
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 30) {
    throw new Error("Přezdívka musí mít 2 až 30 znaků.");
  }

  const cookieStore = await cookies();
  let cookieId = cookieStore.get(ANON_COOKIE)?.value;

  if (cookieId) {
    const existing = await prisma.anonymousUser.findUnique({ where: { cookieId } });
    if (existing) {
      if (existing.nickname !== trimmed) {
        const updated = await prisma.anonymousUser.update({
          where: { id: existing.id },
          data: { nickname: trimmed },
        });
        await prisma.activityLog.create({
          data: {
            action: "NICKNAME_CHANGED",
            anonymousId: updated.id,
            metadata: JSON.stringify({ from: existing.nickname, to: trimmed }),
          },
        });
        return updated;
      }
      return existing;
    }
  }

  cookieId = randomUUID();
  const created = await prisma.anonymousUser.create({
    data: { cookieId, nickname: trimmed },
  });

  cookieStore.set(ANON_COOKIE, cookieId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + ANON_TTL_DAYS * 24 * 60 * 60 * 1000),
    path: "/",
  });

  return created;
}
