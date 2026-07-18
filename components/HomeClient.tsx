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
      {/* Header + Hero — unified dark section */}
      <div className="bg-[#0D1117]">
        <header className="max-w-7xl mx-auto px-6 pt-5 pb-0 flex items-center justify-between">
          <Link href="/" className="text-white font-black text-base tracking-tight">
            Atelier<span className="text-indigo-400">学習</span>
          </Link>
          <nav className="flex items-center gap-7">
            <Link href="/my" className="text-sm text-slate-400 hover:text-white transition-colors">
              マイコース
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">
                管理
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </nav>
        </header>

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
          <p className="text-indigo-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
            Online Learning
          </p>
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
            スキルを、<br />次のステージへ。
          </h1>
          <p className="text-slate-400 text-base max-w-md leading-relaxed mb-8">
            動画でいつでも・どこでも学べる。プロが作ったコースで、確実にスキルアップ。
          </p>
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              コースを追加
            </Link>
          )}
        </div>

        {/* Bottom fade */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase">
            {isLoading ? "" : `${courses?.length ?? 0} コース`}
          </h2>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 animate-pulse">
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
          <div className="py-32 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-4">コースがまだありません</p>
            {isAdmin && (
              <Link href="/admin" className="text-indigo-600 text-sm font-semibold hover:underline">
                最初のコースを作成する →
              </Link>
            )}
          </div>
        )}

        {!isLoading && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
