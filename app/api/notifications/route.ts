import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nepřihlášený." }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const unread = notifications.filter((n) => !n.read).length;
  return Response.json({ notifications, unread });
}
