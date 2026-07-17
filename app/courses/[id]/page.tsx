import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ProgressBar } from "@/components/ProgressBar";

interface Video {
  id: number;
  sectionId: number;
  youtubeId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: number;
}

interface Section {
  id: number;
  courseId: number;
  title: string;
  order: number;
  videos: Video[];
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: number;
  sections: Section[];
}

interface Enrollment {
  id: number;
  userId: string;
  courseId: number;
  enrolledAt: number;
  completedAt: number | null;
}

interface ProgressInfo {
  completed: number;
  total: number;
  percentage: number;
}

async function getCourseData(id: string, headersList: Headers) {
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  const [courseRes, session] = await Promise.all([
    fetch(`${baseUrl}/api/courses/${id}`, { headers: headersList }),
    auth.api.getSession({ headers: headersList }),
  ]);

  if (!courseRes.ok) return { course: null, session, enrollment: null, progressInfo: null };

  const course: Course = await courseRes.json();

  let enrollment: Enrollment | null = null;
  let progressInfo: ProgressInfo | null = null;

  if (session) {
    const myCoursesRes = await fetch(`${baseUrl}/api/my/courses`, { headers: headersList });
    if (myCoursesRes.ok) {
      const myCourses = await myCoursesRes.json();
      const myEnrollment = myCourses.find(
        (e: { course: { id: number }; enrollmentId: number; progress: ProgressInfo }) =>
          e.course.id === course.id
      );
      if (myEnrollment) {
        enrollment = { id: myEnrollment.enrollmentId } as Enrollment;
        progressInfo = myEnrollment.progress;
      }
    }
  }

  return { course, session, enrollment, progressInfo };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const { course, session, enrollment, progressInfo } = await getCourseData(id, headersList);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest mb-3">404</p>
          <h1 className="text-2xl font-black text-[#111110] tracking-tight">コースが見つかりません</h1>
          <Link href="/" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const totalVideos = course.sections.reduce((acc, s) => acc + s.videos.length, 0);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="bg-[#0F172A]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← 戻る
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300 text-sm truncate">{course.title}</span>
        </div>
      </header>

      {course.thumbnailUrl && (
        <div className="relative aspect-[21/6] w-full overflow-hidden bg-slate-900">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-5xl mx-auto w-full px-6 pb-8">
            <h1 className="text-3xl font-black text-white tracking-tight">{course.title}</h1>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {!course.thumbnailUrl && (
          <h1 className="text-3xl font-black text-[#111110] tracking-tight mb-4">{course.title}</h1>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {course.description && (
              <p className="text-[#6B6B6B] leading-relaxed mb-6">{course.description}</p>
            )}

            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest">カリキュラム</h2>
              {course.sections.length === 0 && (
                <p className="text-[#6B6B6B] text-sm">セクションがまだありません</p>
              )}
              {course.sections.map((section, sIdx) => (
                <div key={section.id} className="border border-[#E5E4E0] bg-white">
                  <div className="px-5 py-3 border-b border-[#E5E4E0] flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-600 tabular-nums">
                      {String(sIdx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold text-[#111110] text-sm">{section.title}</h3>
                    <span className="ml-auto text-xs text-[#6B6B6B]">{section.videos.length}本</span>
                  </div>
                  <ul>
                    {section.videos.map((video) => (
                      <li key={video.id} className="border-b border-[#F0EFEB] last:border-0">
                        <Link
                          href={`/courses/${course.id}/videos/${video.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-indigo-50 transition-colors group"
                        >
                          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-[#111110] group-hover:text-indigo-700 transition-colors">{video.title}</span>
                        </Link>
                      </li>
                    ))}
                    {section.videos.length === 0 && (
                      <li className="px-5 py-3 text-sm text-[#6B6B6B]">動画がまだありません</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border border-[#E5E4E0] p-6 sticky top-6">
              <div className="text-center mb-5">
                <p className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-1">このコース</p>
                <p className="text-2xl font-black text-[#111110]">{totalVideos}<span className="text-sm font-normal text-[#6B6B6B] ml-1">本の動画</span></p>
              </div>

              {enrollment && progressInfo && (
                <div className="mb-5">
                  <ProgressBar completed={progressInfo.completed} total={progressInfo.total} />
                </div>
              )}

              {session && !enrollment && (
                <EnrollButton courseId={course.id} />
              )}

              {enrollment && (
                <Link
                  href={course.sections[0]?.videos[0] ? `/courses/${course.id}/videos/${course.sections[0].videos[0].id}` : "#"}
                  className="block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                  学習を続ける →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EnrollButton({ courseId }: { courseId: number }) {
  return (
    <form
      action={async () => {
        "use server";
        const { headers: nextHeaders } = await import("next/headers");
        const { redirect } = await import("next/navigation");
        const headersList = await nextHeaders();
        const { auth: authServer } = await import("@/lib/auth");
        const session = await authServer.api.getSession({ headers: headersList });
        if (!session) redirect("/login");
        const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
        await fetch(`${baseUrl}/api/courses/${courseId}/enroll`, {
          method: "POST",
          headers: headersList,
        });
        redirect(`/courses/${courseId}`);
      }}
    >
      <button
        type="submit"
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
      >
        受講登録する
      </button>
    </form>
  );
}
