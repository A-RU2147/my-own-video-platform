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
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="bg-[#0F172A]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-black text-lg tracking-tight">
            Atelier<span className="text-indigo-400">学習</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/my" className="text-sm text-slate-300 hover:text-white transition-colors">
              マイコース
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-slate-300 hover:text-white transition-colors">
                管理
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </nav>
        </div>
      </header>

      <div className="bg-[#0F172A] border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">コース一覧</p>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            あなたのスキルを<br className="sm:hidden" />次のレベルへ。
          </h1>
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              コースを追加
            </Link>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E4E0] animate-pulse">
                <div className="aspect-video bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && courses?.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-400 text-sm">まだコースがありません</p>
            {isAdmin && (
              <Link href="/admin" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">
                最初のコースを作成する →
              </Link>
            )}
          </div>
        )}

        {!isLoading && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
