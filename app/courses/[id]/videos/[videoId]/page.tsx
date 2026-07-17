"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { CommentSection } from "@/components/CommentSection";

interface Video {
  id: number;
  sectionId: number;
  youtubeId: string;
  title: string;
  description: string | null;
  order: number;
}

interface Section {
  id: number;
  courseId: number;
  title: string;
  order: number;
  videos: Video[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function VideoPage() {
  const params = useParams();
  const courseId = params.id as string;
  const videoId = params.videoId as string;

  const { data: sections } = useSWR<Section[]>(
    `/api/courses/${courseId}/sections`,
    fetcher
  );

  const [markingDone, setMarkingDone] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState("");

  // Find current video and next video
  const allVideos: Video[] = sections?.flatMap((s) => s.videos) ?? [];
  const currentVideo = allVideos.find((v) => v.id === parseInt(videoId, 10));
  const currentIndex = allVideos.findIndex((v) => v.id === parseInt(videoId, 10));
  const nextVideo = currentIndex >= 0 ? allVideos[currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    setMarkingDone(true);
    setError("");
    try {
      const res = await fetch(`/api/videos/${videoId}/progress`, {
        method: "POST",
      });
      if (res.ok) {
        setMarked(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "エラーが発生しました");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setMarkingDone(false);
    }
  };

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">動画を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← コースに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <YouTubeEmbed youtubeId={currentVideo.youtubeId} title={currentVideo.title} />
        </div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{currentVideo.title}</h1>
            {currentVideo.description && (
              <p className="text-gray-600 mt-2">{currentVideo.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {marked ? (
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                視聴完了
              </span>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={markingDone}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {markingDone ? "記録中..." : "視聴完了"}
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {nextVideo && (
          <div className="mb-6">
            <Link
              href={`/courses/${courseId}/videos/${nextVideo.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 text-sm rounded-lg hover:bg-blue-50 transition-colors"
            >
              次の動画: {nextVideo.title} →
            </Link>
          </div>
        )}

        <CommentSection videoId={parseInt(videoId, 10)} />
      </main>
    </div>
  );
}
