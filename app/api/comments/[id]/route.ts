import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { getAnonymousUser } from "@/lib/anonymous";
import { CommentUpdateSchema } from "@/lib/validators";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return Response.json({ error: "Nenalezeno." }, { status: 404 });
  if (comment.deleted) return Response.json({ error: "Komentář je odstraněný." }, { status: 400 });

  const user = await getCurrentUser();
  const anon = user ? null : await getAnonymousUser();

  const isOwner =
    (user && comment.authorId === user.id) ||
    (anon && comment.anonymousId === anon.id);

  if (!isOwner) {
    return Response.json({ error: "Nemáš oprávnění." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  const parsed = CommentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content: parsed.data.content },
  });
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { _count: { select: { replies: true } } },
  });
  if (!comment) return Response.json({ error: "Nenalezeno." }, { status: 404 });

  const user = await getCurrentUser();
  const anon = user ? null : await getAnonymousUser();

  const isOwner =
    (user && comment.authorId === user.id) ||
    (anon && comment.anonymousId === anon.id);
  const isAdmin = user?.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return Response.json({ error: "Nemáš oprávnění." }, { status: 403 });
  }

  if (comment._count.replies > 0) {
    await prisma.comment.update({
      where: { id },
      data: { deleted: true, content: "" },
    });
    return Response.json({ ok: true, soft: true });
  }

  await prisma.comment.delete({ where: { id } });
  return Response.json({ ok: true, soft: false });
}
