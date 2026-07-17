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

import { GET, DELETE } from "@/app/api/videos/[id]/route";
import { db } from "@/db";
import { auth } from "@/lib/auth";

const mockVideo = {
  id: 1,
  youtubeId: "dQw4w9WgXcQ",
  title: "テスト動画",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  createdAt: 1000000,
};
const mockTag = { id: 1, name: "tech" };

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/videos/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. 存在する動画を取得 → 200 + tags 配列付き", async () => {
    vi.mocked(db.query.videos.findFirst).mockResolvedValue(mockVideo);
    const mockWhere = vi.fn().mockResolvedValue([{ tagId: 1 }]);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({ where: mockWhere }),
    } as any);
    vi.mocked(db.query.tags.findMany).mockResolvedValue([mockTag]);

    const req = new NextRequest("http://localhost:3000/api/videos/1");
    const res = await GET(req, makeParams("1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.tags).toEqual([mockTag]);
  });

  it("2. 存在しない動画を取得 → 404", async () => {
    vi.mocked(db.query.videos.findFirst).mockResolvedValue(undefined);

    const req = new NextRequest("http://localhost:3000/api/videos/999");
    const res = await GET(req, makeParams("999"));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Not found");
  });

  it("3. タグなし動画の取得 → tags が空配列", async () => {
    vi.mocked(db.query.videos.findFirst).mockResolvedValue(mockVideo);
    const mockWhere = vi.fn().mockResolvedValue([]);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({ where: mockWhere }),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/videos/1");
    const res = await GET(req, makeParams("1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.tags).toEqual([]);
  });
});

describe("DELETE /api/videos/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. 未認証で削除リクエスト → 401", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/videos/1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("1"));

    expect(res.status).toBe(401);
  });

  it("2. 認証済みで削除 → 204", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/videos/1", {
      method: "DELETE",
    });
    const res = await DELETE(req, makeParams("1"));

    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });
});
