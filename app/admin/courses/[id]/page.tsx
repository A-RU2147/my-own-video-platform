import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import { db } from "@/db";
import { courses, sections, videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminCourseEditor } from "./AdminCourseEditor";

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  const courseId = parseInt(id, 10);

  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .then((rows) => rows[0]);

  if (!course) {
    redirect("/admin");
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            ← 管理者ページに戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-800">コース編集</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AdminCourseEditor course={course} sections={sectionsWithVideos} />
      </main>
    </div>
  );
}
