import { NextRequest } from "next/server";
import { db } from "@/db";
import { certificates, courses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const result = await db
    .select({
      id: certificates.id,
      issuedAt: certificates.issuedAt,
      courseId: courses.id,
      courseTitle: courses.title,
      courseThumbnailUrl: courses.thumbnailUrl,
    })
    .from(certificates)
    .leftJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId))
    .orderBy(certificates.issuedAt);

  return Response.json(result);
}
