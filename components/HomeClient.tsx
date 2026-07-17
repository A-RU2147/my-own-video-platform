"use client";

import useSWR from "swr";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { CourseCard } from "./CourseCard";
import type { Course } from "@/db/schema";
import { ADMIN_EMAIL } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  userEmail?: string;
}

export function HomeClient({ userEmail }: Props) {
  const { data: courses, isLoading } = useSWR<Course[]>("/api/courses", fetcher);
  const isAdmin = userEmail === ADMIN_EMAIL;

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">オンライン講座プラットフォーム</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/my"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              マイページ
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                管理者ページ
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">コース一覧</h2>
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              コースを追加
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && courses?.length === 0 && (
          <p className="text-gray-500 text-center py-12">コースがまだありません</p>
        )}

        {!isLoading && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
