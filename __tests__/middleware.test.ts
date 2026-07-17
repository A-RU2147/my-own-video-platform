import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { middleware } from "@/middleware";
import { auth } from "@/lib/auth";

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`);
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. ログイン済みでホームアクセス → そのまま通過", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "1" } } as any);
    const res = await middleware(makeRequest("/"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("2. 未ログインでホームアクセス → /login へリダイレクト", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/"));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("3. /login は認証スキップ", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/login"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("4. /api/auth/* は認証スキップ", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/api/auth/sign-in/email"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("5. /_next/* は認証スキップ", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/_next/static/chunk.js"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("6. /favicon.ico は認証スキップ", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/favicon.ico"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("7. 未ログインで動画詳細アクセス → /login へリダイレクト", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/videos/1"));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("8. 未ログインでAPI直打ち → /login へリダイレクト", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const res = await middleware(makeRequest("/api/videos"));
    expect(res.headers.get("location")).toContain("/login");
  });
});
