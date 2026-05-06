import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { getAnonymousUser } from "@/lib/anonymous";
import { CommentSchema } from "@/lib/validators";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      anonymous: { select: { id: true, nickname: true } },
    },
  });
  return Response.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return Response.json({ error: "Příspěvek neexistuje." }, { status: 404 });

  const user = await getCurrentUser();
  const anon = user ? null : await getAnonymousUser();

  if (!user && !anon) {
    return Response.json(
      { error: "Pro psaní komentáře musíš být přihlášen nebo mít nastavenou přezdívku." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { content, parentId } = parsed.data;

  let parent: { id: string; authorId: string | null } | null = null;
  if (parentId) {
    const found = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, authorId: true, postId: true },
    });
    if (!found || found.postId !== postId) {
      return Response.json({ error: "Neplatný parent komentář." }, { status: 400 });
    }
    parent = found;
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      parentId: parent?.id ?? null,
      authorId: user?.id ?? null,
      anonymousId: anon?.id ?? null,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      anonymous: { select: { id: true, nickname: true } },
    },
  });

  const authorLabel = user ? (user.name ?? user.email) : (anon?.nickname ?? "Anonym");

  await prisma.activityLog.create({
    data: {
      action: parent ? "COMMENT_REPLIED" : "COMMENT_CREATED",
      userId: user?.id ?? null,
      anonymousId: anon?.id ?? null,
      targetType: "Comment",
      targetId: comment.id,
    },
  });

  if (parent && parent.authorId && parent.authorId !== user?.id) {
    await prisma.notification.create({
      data: {
        type: "COMMENT_REPLY",
        userId: parent.authorId,
        message: `${authorLabel} odpověděl na tvůj komentář.`,
        linkUrl: `/posts/${postId}#c-${comment.id}`,
      },
    });
  } else if (post.authorId !== user?.id) {
    await prisma.notification.create({
      data: {
        type: "NEW_COMMENT",
        userId: post.authorId,
        message: `${authorLabel} přidal komentář k tvému příspěvku „${post.title}“.`,
        linkUrl: `/posts/${postId}#c-${comment.id}`,
      },
    });
  }

  return Response.json(comment, { status: 201 });
}
