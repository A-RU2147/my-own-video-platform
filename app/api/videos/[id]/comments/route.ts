import { NextRequest } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { user } from "@/db/auth-schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const videoId = parseInt(id, 10);

  const result = await db
    .select({
      id: comments.id,
      userId: comments.userId,
      videoId: comments.videoId,
      body: comments.body,
      createdAt: comments.createdAt,
      userName: user.name,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.videoId, videoId))
    .orderBy(comments.createdAt);

  return Response.json(result);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const videoId = parseInt(id, 10);

  const { body } = await request.json();
  if (!body || !body.trim()) {
    return Response.json({ error: "Body is required" }, { status: 400 });
  }

  const [comment] = await db
    .insert(comments)
    .values({
      userId: session.user.id,
      videoId,
      body: body.trim(),
      createdAt: Date.now(),
    })
    .returning();

  return Response.json(comment, { status: 201 });
}
