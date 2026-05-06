import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nepřihlášený." }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return Response.json({ ok: true });
}
