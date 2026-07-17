"use client";

import useSWR from "swr";
import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";

interface MyCourse {
  enrollmentId: number;
  enrolledAt: number;
  completedAt: number | null;
  course: {
    id: number;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface Certificate {
  id: number;
  issuedAt: number;
  courseId: number;
  courseTitle: string | null;
  courseThumbnailUrl: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MyPage() {
  const { data: myCourses, isLoading: loadingCourses } = useSWR<MyCourse[]>("/api/my/courses", fetcher);
  const { data: certificates, isLoading: loadingCerts } = useSWR<Certificate[]>("/api/my/certificates", fetcher);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-black text-lg tracking-tight">
            Atelier<span className="text-indigo-400">学習</span>
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← ホームに戻る
          </Link>
        </div>
      </header>

      <div className="bg-[#0F172A] border-t border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-2">マイページ</p>
          <h1 className="text-3xl font-black text-white tracking-tight">あなたの学習記録</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        <section>
          <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest mb-5">受講中のコース</h2>

          {loadingCourses && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-[#E5E4E0] animate-pulse">
                  <div className="aspect-video bg-slate-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingCourses && myCourses?.length === 0 && (
            <div className="py-16 text-center border border-dashed border-[#E5E4E0]">
              <p className="text-[#6B6B6B] text-sm">受講中のコースがありません</p>
              <Link href="/" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline">
                コースを探す →
              </Link>
            </div>
          )}

          {!loadingCourses && myCourses && myCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCourses.map((item) => (
                <Link
                  key={item.enrollmentId}
                  href={`/courses/${item.course.id}`}
                  className="group block bg-white border border-[#E5E4E0] hover:border-indigo-500 transition-colors overflow-hidden"
                >
                  {item.course.thumbnailUrl ? (
                    <img
                      src={item.course.thumbnailUrl}
                      alt={item.course.title ?? ""}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-[#111110] tracking-tight line-clamp-2 mb-4">
                      {item.course.title}
                    </h3>
                    <ProgressBar completed={item.progress.completed} total={item.progress.total} />
                    {item.completedAt && (
                      <span className="inline-block mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                        修了済み
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest mb-5">修了証</h2>

          {loadingCerts && <p className="text-[#6B6B6B] text-sm">読み込み中...</p>}

          {!loadingCerts && certificates?.length === 0 && (
            <p className="text-[#6B6B6B] text-sm">まだ修了証がありません</p>
          )}

          {!loadingCerts && certificates && certificates.length > 0 && (
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-white border border-[#E5E4E0] p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#111110] tracking-tight">{cert.courseTitle}</h3>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      修了日: {new Date(cert.issuedAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="shrink-0 w-10 h-10 bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
