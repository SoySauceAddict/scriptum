import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { PostUpdateSchema } from "@/lib/validators";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) return Response.json({ error: "Nenalezeno." }, { status: 404 });
  return Response.json(post);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nepřihlášený." }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return Response.json({ error: "Nenalezeno." }, { status: 404 });

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return Response.json({ error: "Nemáš oprávnění." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  const parsed = PostUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await prisma.post.update({ where: { id }, data: parsed.data });
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nepřihlášený." }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return Response.json({ error: "Nenalezeno." }, { status: 404 });

  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return Response.json({ error: "Nemáš oprávnění." }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  return Response.json({ ok: true });
}
