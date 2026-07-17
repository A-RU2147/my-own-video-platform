import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/db", () => ({
  db: {
    query: {
      videos: { findMany: vi.fn(), findFirst: vi.fn() },
      tags: { findMany: vi.fn(), findFirst: vi.fn() },
    },
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("@/lib/youtube", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/youtube")>();
  return { ...original, fetchYouTubeInfo: vi.fn() };
});

import { GET, POST } from "@/app/api/videos/route";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { fetchYouTubeInfo } from "@/lib/youtube";

const mockVideo = {
  id: 1,
  youtubeId: "dQw4w9WgXcQ",
  title: "テスト動画",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  createdAt: 1000000,
};
const mockTag = { id: 1, name: "tech" };

function makeRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

function setupSelect(...returnValues: any[][]) {
  let call = 0;
  const mockWhere = vi.fn().mockImplementation(() =>
    Promise.resolve(returnValues[call++] ?? [])
  );
  vi.mocked(db.select).mockReturnValue({
    from: vi.fn().mockReturnValue({ where: mockWhere }),
  } as any);
  return mockWhere;
}

describe("GET /api/videos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. 動画一覧取得（タグなし）", async () => {
    vi.mocked(db.query.videos.findMany).mockResolvedValue([mockVideo, { ...mockVideo, id: 2 }]);
    setupSelect([], []);
    vi.mocked(db.query.tags.findMany).mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/videos");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
  });

  it("2. 存在するタグで絞り込み", async () => {
    vi.mocked(db.query.tags.findFirst).mockResolvedValue(mockTag);
    setupSelect([{ videoId: 1 }], [{ tagId: 1 }]);
    vi.mocked(db.query.videos.findMany).mockResolvedValue([mockVideo]);
    vi.mocked(db.query.tags.findMany).mockResolvedValue([mockTag]);

    const req = makeRequest("http://localhost:3000/api/videos?tag=tech");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it("3. 存在しないタグで絞り込み", async () => {
    vi.mocked(db.query.tags.findFirst).mockResolvedValue(undefined);

    const req = makeRequest("http://localhost:3000/api/videos?tag=unknown");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("4. タグはあるが紐づき動画なし", async () => {
    vi.mocked(db.query.tags.findFirst).mockResolvedValue(mockTag);
    setupSelect([]);

    const req = makeRequest("http://localhost:3000/api/videos?tag=tech");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("5. 各動画に tags 配列が付いている", async () => {
    vi.mocked(db.query.videos.findMany).mockResolvedValue([mockVideo]);
    setupSelect([{ tagId: 1 }]);
    vi.mocked(db.query.tags.findMany).mockResolvedValue([mockTag]);

    const req = makeRequest("http://localhost:3000/api/videos");
    const res = await GET(req);
    const data = await res.json();

    expect(data[0].tags).toEqual([mockTag]);
  });
});

describe("POST /api/videos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. 未認証でリクエスト → 401", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("2. 無効なURL → 400", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/not-youtube" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid YouTube URL");
  });

  it("3. oEmbed 取得失敗 → 400", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(fetchYouTubeInfo).mockRejectedValue(new Error("fetch failed"));

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Failed to fetch video info");
  });

  it("4. 正常登録 → 201", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(fetchYouTubeInfo).mockResolvedValue({
      title: "テスト動画",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockVideo]),
        }),
      }),
    } as any);

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.youtubeId).toBe("dQw4w9WgXcQ");
  });

  it("5. 重複登録 → 409", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(fetchYouTubeInfo).mockResolvedValue({
      title: "テスト動画",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any);

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Video already exists");
  });

  it("6. tagIds 付きで登録 → db.insert が2回呼ばれる", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(fetchYouTubeInfo).mockResolvedValue({
      title: "テスト動画",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
    vi.mocked(db.insert)
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockVideo]),
          }),
        }),
      } as any)
      .mockReturnValueOnce({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ", tagIds: [1, 2] }),
    });
    await POST(req);

    expect(vi.mocked(db.insert)).toHaveBeenCalledTimes(2);
  });

  it("7. tagIds なしで登録 → db.insert が1回のみ呼ばれる", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(fetchYouTubeInfo).mockResolvedValue({
      title: "テスト動画",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockVideo]),
        }),
      }),
    } as any);

    const req = makeRequest("http://localhost:3000/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://youtu.be/dQw4w9WgXcQ" }),
    });
    await POST(req);

    expect(vi.mocked(db.insert)).toHaveBeenCalledTimes(1);
  });
});
