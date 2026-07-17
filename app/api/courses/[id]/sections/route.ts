import { NextRequest } from "next/server";
import { db } from "@/db";
import { sections, videos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(sections.order);

  const sectionsWithVideos = await Promise.all(
    courseSections.map(async (section) => {
      const sectionVideos = await db
        .select()
        .from(videos)
        .where(eq(videos.sectionId, section.id))
        .orderBy(videos.order);
      return { ...section, videos: sectionVideos };
    })
  );

  return Response.json(sectionsWithVideos);
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
  const courseId = parseInt(id, 10);

  const { title, order } = await request.json();
  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const [section] = await db
    .insert(sections)
    .values({ courseId, title, order: order ?? 0 })
    .returning();

  return Response.json(section, { status: 201 });
}
