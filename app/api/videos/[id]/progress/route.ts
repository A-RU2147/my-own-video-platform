import { NextRequest } from "next/server";
import { db } from "@/db";
import { enrollments, progress, videos, sections, certificates } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

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
  const userId = session.user.id;

  // Find the video to get sectionId → courseId
  const video = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoId))
    .then((rows) => rows[0]);

  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const section = await db
    .select()
    .from(sections)
    .where(eq(sections.id, video.sectionId))
    .then((rows) => rows[0]);

  if (!section) {
    return Response.json({ error: "Section not found" }, { status: 404 });
  }

  const courseId = section.courseId;

  // Check enrollment
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .then((rows) => rows[0]);

  if (!enrollment) {
    return Response.json({ error: "Not enrolled" }, { status: 403 });
  }

  // Check if already completed
  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.videoId, videoId)))
    .then((rows) => rows[0]);

  if (existing) {
    return Response.json(existing);
  }

  // Record progress
  const [progressRecord] = await db
    .insert(progress)
    .values({ userId, videoId, completedAt: Date.now() })
    .returning();

  // Check if all videos in the course are completed
  // Get all section IDs for this course
  const courseSections = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, courseId));

  const sectionIds = courseSections.map((s) => s.id);

  // Get all videos in the course
  const allCourseVideos: typeof videos.$inferSelect[] = [];
  for (const sid of sectionIds) {
    const svids = await db.select().from(videos).where(eq(videos.sectionId, sid));
    allCourseVideos.push(...svids);
  }

  // Get all completed videos for this user in this course
  const completedVideoIds = new Set<number>();
  for (const v of allCourseVideos) {
    const prog = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.videoId, v.id)))
      .then((rows) => rows[0]);
    if (prog) completedVideoIds.add(v.id);
  }

  const allCompleted = allCourseVideos.every((v) => completedVideoIds.has(v.id));

  if (allCompleted && !enrollment.completedAt) {
    const now = Date.now();
    // Update enrollment completedAt
    await db
      .update(enrollments)
      .set({ completedAt: now })
      .where(eq(enrollments.id, enrollment.id));

    // Issue certificate
    await db.insert(certificates).values({
      userId,
      courseId,
      issuedAt: now,
    });
  }

  return Response.json(progressRecord, { status: 201 });
}
