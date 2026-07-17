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

import { GET, POST } from "@/app/api/tags/route";
import { db } from "@/db";
import { auth } from "@/lib/auth";

const mockTag = { id: 1, name: "tech" };

function makePostRequest(body: object): NextRequest {
  return new NextRequest("http://localhost:3000/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. タグ一覧取得 → 200 + 配列3件", async () => {
    const tags = [
      { id: 1, name: "tech" },
      { id: 2, name: "music" },
      { id: 3, name: "sports" },
    ];
    vi.mocked(db.query.tags.findMany).mockResolvedValue(tags);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(3);
  });

  it("2. タグなし → 200 + 空配列", async () => {
    vi.mocked(db.query.tags.findMany).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });
});

describe("POST /api/tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. 未認証でリクエスト → 401", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const res = await POST(makePostRequest({ name: "tech" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("2. 空文字のタグ名 → 400", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);

    const res = await POST(makePostRequest({ name: "" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Name is required");
  });

  it("3. スペースのみのタグ名 → 400", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);

    const res = await POST(makePostRequest({ name: "  " }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Name is required");
  });

  it("4. 正常登録 → 201 + タグオブジェクト", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTag]),
        }),
      }),
    } as any);

    const res = await POST(makePostRequest({ name: "tech" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(mockTag);
  });

  it("5. 重複タグ名 → 409", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any);

    const res = await POST(makePostRequest({ name: "tech" }));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Tag already exists");
  });

  it("6. 前後スペースのトリム → DB には trim 済みの値が渡される", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    const mockValues = vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1, name: "tech" }]),
      }),
    });
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    await POST(makePostRequest({ name: " tech " }));

    expect(mockValues).toHaveBeenCalledWith({ name: "tech" });
  });
});
