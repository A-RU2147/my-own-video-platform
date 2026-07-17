import { NextRequest } from "next/server";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import { extractYouTubeId } from "@/lib/youtube";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sectionId = parseInt(id, 10);

  const result = await db
    .select()
    .from(videos)
    .where(eq(videos.sectionId, sectionId))
    .orderBy(videos.order);

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
  if (session.user.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sectionId = parseInt(id, 10);

  const { url, title, description, order } = await request.json();
  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }
  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const youtubeId = extractYouTubeId(url);
  if (!youtubeId) {
    return Response.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  const [video] = await db
    .insert(videos)
    .values({
      sectionId,
      youtubeId,
      title,
      description: description ?? null,
      order: order ?? 0,
      createdAt: Date.now(),
    })
    .returning();

  return Response.json(video, { status: 201 });
}
