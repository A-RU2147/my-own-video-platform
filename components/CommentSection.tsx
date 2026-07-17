"use client";

import { useState } from "react";
import useSWR from "swr";

interface Comment {
  id: number;
  userId: string;
  videoId: number;
  body: string;
  createdAt: number;
  userName: string | null;
}

interface Props {
  videoId: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CommentSection({ videoId }: Props) {
  const { data: comments, mutate } = useSWR<Comment[]>(
    `/api/videos/${videoId}/comments`,
    fetcher
  );
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "コメントの投稿に失敗しました");
        return;
      }
      setBody("");
      mutate();
    } catch {
      setError("コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">コメント</h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力..."
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments?.length === 0 && (
          <p className="text-sm text-gray-500">まだコメントがありません</p>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                {comment.userName ?? "匿名"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
