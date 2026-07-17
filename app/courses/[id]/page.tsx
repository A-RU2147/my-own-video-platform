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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">コースが見つかりません</h1>
          <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            ← ホームに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {course.thumbnailUrl && (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full aspect-video object-cover rounded-xl mb-6"
          />
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-3">{course.title}</h1>
        {course.description && (
          <p className="text-gray-600 mb-6">{course.description}</p>
        )}

        {enrollment && progressInfo && (
          <div className="mb-6">
            <ProgressBar completed={progressInfo.completed} total={progressInfo.total} />
          </div>
        )}

        {session && !enrollment && (
          <EnrollButton courseId={course.id} />
        )}

        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">カリキュラム</h2>
          {course.sections.length === 0 && (
            <p className="text-gray-500">セクションがまだありません</p>
          )}
          {course.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-700">{section.title}</h3>
              </div>
              <ul className="divide-y">
                {section.videos.map((video) => (
                  <li key={video.id}>
                    <Link
                      href={`/courses/${course.id}/videos/${video.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-700">{video.title}</span>
                    </Link>
                  </li>
                ))}
                {section.videos.length === 0 && (
                  <li className="px-5 py-3 text-sm text-gray-400">動画がまだありません</li>
                )}
              </ul>
            </div>
          ))}
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
        if (!session) {
          redirect("/login");
        }
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
        className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        受講登録する
      </button>
    </form>
  );
}
