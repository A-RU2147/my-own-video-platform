import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/db/schema";

interface Props {
  course: Course;
}

export function CourseCard({ course }: Props) {
  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden">
        {course.thumbnailUrl ? (
          <div className="relative aspect-video w-full">
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No thumbnail</span>
          </div>
        )}
        <div className="p-4">
          <h2 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {course.title}
          </h2>
          {course.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
          )}
          {!course.published && (
            <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
              未公開
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
