import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/db/schema";

interface Props {
  course: Course;
}

export function CourseCard({ course }: Props) {
  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          )}
          {!course.published && (
            <div className="absolute top-2.5 left-2.5">
              <span className="text-[10px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 uppercase tracking-wide">
                Draft
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h2 className="font-bold text-[#111110] text-sm leading-snug tracking-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {course.title}
          </h2>
          {course.description && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
              {course.published ? "公開中" : "未公開"}
            </span>
            <span className="text-[11px] font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
              見る →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
