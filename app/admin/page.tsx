import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/constants";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { AdminCourseForm } from "./AdminCourseForm";

export default async function AdminPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  const allCourses = await db.select().from(courses).orderBy(courses.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
              ← ホームに戻る
            </Link>
            <h1 className="text-xl font-bold text-gray-800">管理者ページ</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">新規コース作成</h2>
            <AdminCourseForm />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">コース一覧</h2>
            {allCourses.length === 0 ? (
              <p className="text-gray-500">コースがまだありません</p>
            ) : (
              <div className="space-y-3">
                {allCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          course.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {course.published ? "公開中" : "未公開"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      編集
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
