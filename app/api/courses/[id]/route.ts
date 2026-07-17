import { NextRequest } from "next/server";
import { db } from "@/db";
import { courses, sections, videos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .then((rows) => rows[0]);

  if (!course) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId))
    .orderBy(sections.order);

  const sectionIds = courseSections.map((s) => s.id);

  let sectionVideos: typeof videos.$inferSelect[] = [];
  if (sectionIds.length > 0) {
    sectionVideos = await db
      .select()
      .from(videos)
      .where(
        sectionIds.length === 1
          ? eq(videos.sectionId, sectionIds[0])
          : eq(videos.sectionId, sectionIds[0])
      )
      .orderBy(videos.order);

    // Fetch videos for all sections
    sectionVideos = [];
    for (const sectionId of sectionIds) {
      const svids = await db
        .select()
        .from(videos)
        .where(eq(videos.sectionId, sectionId))
        .orderBy(videos.order);
      sectionVideos.push(...svids);
    }
  }

  const sectionsWithVideos = courseSections.map((section) => ({
    ...section,
    videos: sectionVideos.filter((v) => v.sectionId === section.id),
  }));

  return Response.json({ ...course, sections: sectionsWithVideos });
}

export async function PUT(
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

  const { title, description, thumbnailUrl, published } = await request.json();

  const [updated] = await db
    .update(courses)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(published !== undefined && { published }),
    })
    .where(eq(courses.id, courseId))
    .returning();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
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

  await db.delete(courses).where(eq(courses.id, courseId));

  return new Response(null, { status: 204 });
}
