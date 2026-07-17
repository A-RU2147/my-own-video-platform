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
  const { data: myCourses, isLoading: loadingCourses } = useSWR<MyCourse[]>(
    "/api/my/courses",
    fetcher
  );
  const { data: certificates, isLoading: loadingCerts } = useSWR<Certificate[]>(
    "/api/my/certificates",
    fetcher
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            ← ホームに戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-800">マイページ</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Enrolled courses */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">受講中のコース</h2>
          {loadingCourses && <p className="text-gray-400 text-sm">読み込み中...</p>}
          {!loadingCourses && myCourses?.length === 0 && (
            <p className="text-gray-500">
              まだ受講しているコースがありません。
              <Link href="/" className="text-blue-500 hover:underline ml-1">
                コースを探す
              </Link>
            </p>
          )}
          {!loadingCourses && myCourses && myCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCourses.map((item) => (
                <Link
                  key={item.enrollmentId}
                  href={`/courses/${item.course.id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
                >
                  {item.course.thumbnailUrl ? (
                    <img
                      src={item.course.thumbnailUrl}
                      alt={item.course.title ?? ""}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No thumbnail</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-3">
                      {item.course.title}
                    </h3>
                    <ProgressBar
                      completed={item.progress.completed}
                      total={item.progress.total}
                    />
                    {item.completedAt && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        修了
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">修了証</h2>
          {loadingCerts && <p className="text-gray-400 text-sm">読み込み中...</p>}
          {!loadingCerts && certificates?.length === 0 && (
            <p className="text-gray-500">まだ修了証がありません</p>
          )}
          {!loadingCerts && certificates && certificates.length > 0 && (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{cert.courseTitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      修了日: {new Date(cert.issuedAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <span className="text-yellow-500">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
