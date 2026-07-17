"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, Section, Video } from "@/db/schema";

interface SectionWithVideos extends Section {
  videos: Video[];
}

interface Props {
  course: Course;
  sections: SectionWithVideos[];
}

export function AdminCourseEditor({ course, sections }: Props) {
  const router = useRouter();

  // Course edit state
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl ?? "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [published, setPublished] = useState(course.published);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Section add state
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionOrder, setSectionOrder] = useState(sections.length);
  const [addingSection, setAddingSection] = useState(false);
  const [sectionError, setSectionError] = useState("");

  // Video add state per section
  const [videoForms, setVideoForms] = useState<
    Record<number, { url: string; title: string; description: string; order: number }>
  >({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    setSaveError("");
    try {
      let finalThumbnailUrl = thumbnailUrl.trim() || null;

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("file", thumbnailFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setSaveError(data.error ?? "画像のアップロードに失敗しました");
          return;
        }
        const { url } = await uploadRes.json();
        finalThumbnailUrl = url;
        setThumbnailUrl(url);
        setThumbnailFile(null);
        setThumbnailPreview("");
      }

      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          thumbnailUrl: finalThumbnailUrl,
          published,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? "保存に失敗しました");
        return;
      }
      router.refresh();
    } catch {
      setSaveError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!sectionTitle.trim()) return;
    setAddingSection(true);
    setSectionError("");
    try {
      const res = await fetch(`/api/courses/${course.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sectionTitle.trim(), order: sectionOrder }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSectionError(data.error ?? "セクションの追加に失敗しました");
        return;
      }
      setSectionTitle("");
      setSectionOrder((prev) => prev + 1);
      router.refresh();
    } catch {
      setSectionError("セクションの追加に失敗しました");
    } finally {
      setAddingSection(false);
    }
  };

  const handleAddVideo = async (sectionId: number) => {
    const form = videoForms[sectionId];
    if (!form?.url || !form?.title) return;

    try {
      const res = await fetch(`/api/sections/${sectionId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          title: form.title,
          description: form.description || undefined,
          order: form.order ?? 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "動画の追加に失敗しました");
        return;
      }
      setVideoForms((prev) => ({ ...prev, [sectionId]: { url: "", title: "", description: "", order: 0 } }));
      router.refresh();
    } catch {
      alert("動画の追加に失敗しました");
    }
  };

  const updateVideoForm = (
    sectionId: number,
    field: string,
    value: string | number
  ) => {
    setVideoForms((prev) => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? { url: "", title: "", description: "", order: 0 }), [field]: value },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Course info edit */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">コース情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">サムネイル画像</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400">または URL を直接入力</p>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailFile(null); setThumbnailPreview(""); }}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://..."
              />
              {(thumbnailPreview || thumbnailUrl) && (
                <img
                  src={thumbnailPreview || thumbnailUrl}
                  alt="プレビュー"
                  className="w-full aspect-video object-cover rounded-lg border"
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm text-gray-700">公開する</label>
          </div>
          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
          <button
            onClick={handleSaveCourse}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">セクション</h2>

        {sections.map((section) => (
          <div key={section.id} className="mb-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium text-gray-700">{section.title}</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 mb-4">
                {section.videos.map((video) => (
                  <li key={video.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-blue-400">▶</span>
                    {video.title}
                  </li>
                ))}
                {section.videos.length === 0 && (
                  <li className="text-sm text-gray-400">動画がまだありません</li>
                )}
              </ul>

              {/* Add video form */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">動画を追加</p>
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={videoForms[section.id]?.url ?? ""}
                  onChange={(e) => updateVideoForm(section.id, "url", e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="動画タイトル"
                  value={videoForms[section.id]?.title ?? ""}
                  onChange={(e) => updateVideoForm(section.id, "title", e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="説明（省略可）"
                  value={videoForms[section.id]?.description ?? ""}
                  onChange={(e) => updateVideoForm(section.id, "description", e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => handleAddVideo(section.id)}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  動画を追加
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add section form */}
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">新規セクション</p>
          <input
            type="text"
            placeholder="セクションタイトル"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {sectionError && <p className="text-red-500 text-sm">{sectionError}</p>}
          <button
            onClick={handleAddSection}
            disabled={addingSection || !sectionTitle.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {addingSection ? "追加中..." : "セクションを追加"}
          </button>
        </div>
      </div>
    </div>
  );
}
