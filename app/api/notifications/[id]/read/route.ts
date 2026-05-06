import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nepřihlášený." }, { status: 401 });

  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== user.id) {
    return Response.json({ error: "Nenalezeno." }, { status: 404 });
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });
  return Response.json({ ok: true });
}
