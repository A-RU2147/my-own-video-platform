import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/db/schema";

interface Props {
  course: Course;
}

export function CourseCard({ course }: Props) {
  return (
    <Link href={`/courses/${course.id}`} className="group block bg-white border border-[#E5E4E0] hover:border-indigo-500 transition-colors relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />
      {course.thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-slate-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
      )}
      <div className="p-5">
        <h2 className="font-bold text-[#111110] tracking-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {course.title}
        </h2>
        {course.description && (
          <p className="text-sm text-[#6B6B6B] mt-1.5 line-clamp-2 leading-relaxed">{course.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          {!course.published ? (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">
              未公開
            </span>
          ) : (
            <span className="text-xs text-slate-400">公開中</span>
          )}
          <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-block">
            詳細を見る →
          </span>
        </div>
      </div>
    </Link>
  );
}
