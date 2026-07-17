import { NextRequest } from "next/server";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
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
  const courseId = parseInt(id, 10);
  const userId = session.user.id;

  // Check if already enrolled
  const existing = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .then((rows) => rows[0]);

  if (existing) {
    return Response.json({ error: "Already enrolled" }, { status: 409 });
  }

  const [enrollment] = await db
    .insert(enrollments)
    .values({
      userId,
      courseId,
      enrolledAt: Date.now(),
      completedAt: null,
    })
    .returning();

  return Response.json(enrollment, { status: 201 });
}
