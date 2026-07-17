import { NextRequest } from "next/server";
import { db } from "@/db";
import { enrollments, courses, sections, videos, progress } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const userEnrollments = await db
    .select({
      enrollmentId: enrollments.id,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      courseId: courses.id,
      courseTitle: courses.title,
      courseDescription: courses.description,
      courseThumbnailUrl: courses.thumbnailUrl,
    })
    .from(enrollments)
    .leftJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId));

  // For each course, calculate progress
  const result = await Promise.all(
    userEnrollments.map(async (enrollment) => {
      const courseId = enrollment.courseId!;

      // Get all sections and videos for the course
      const courseSections = await db
        .select()
        .from(sections)
        .where(eq(sections.courseId, courseId));

      let totalVideos = 0;
      let completedVideos = 0;

      for (const section of courseSections) {
        const sectionVideos = await db
          .select()
          .from(videos)
          .where(eq(videos.sectionId, section.id));

        totalVideos += sectionVideos.length;

        for (const video of sectionVideos) {
          const prog = await db
            .select()
            .from(progress)
            .where(and(eq(progress.userId, userId), eq(progress.videoId, video.id)))
            .then((rows) => rows[0]);
          if (prog) completedVideos++;
        }
      }

      return {
        enrollmentId: enrollment.enrollmentId,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        course: {
          id: enrollment.courseId,
          title: enrollment.courseTitle,
          description: enrollment.courseDescription,
          thumbnailUrl: enrollment.courseThumbnailUrl,
        },
        progress: {
          completed: completedVideos,
          total: totalVideos,
          percentage: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
        },
      };
    })
  );

  return Response.json(result);
}
