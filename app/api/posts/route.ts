import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { PostSchema } from "@/lib/validators";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });
  return Response.json(posts);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Pouze přihlášení uživatelé mohou psát příspěvky." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON." }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: { ...parsed.data, authorId: user.id },
  });

  await prisma.activityLog.create({
    data: {
      action: "POST_CREATED",
      userId: user.id,
      targetType: "Post",
      targetId: post.id,
    },
  });

  return Response.json(post, { status: 201 });
}
