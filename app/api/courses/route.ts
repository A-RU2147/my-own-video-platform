import { NextRequest } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  let result;
  if (isAdmin) {
    result = await db.select().from(courses).orderBy(courses.createdAt);
  } else {
    result = await db
      .select()
      .from(courses)
      .where(eq(courses.published, true))
      .orderBy(courses.createdAt);
  }

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, thumbnailUrl } = await request.json();
  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const [course] = await db
    .insert(courses)
    .values({
      title,
      description: description ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      instructorId: session.user.id,
      published: false,
      createdAt: Date.now(),
    })
    .returning();

  return Response.json(course, { status: 201 });
}
