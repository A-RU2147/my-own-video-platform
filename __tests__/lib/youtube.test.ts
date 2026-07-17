import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractYouTubeId, fetchYouTubeInfo } from "@/lib/youtube";

describe("extractYouTubeId", () => {
  it("1. 通常URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("2. 通常URL（クエリパラメータ付き）", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s")).toBe("dQw4w9WgXcQ");
  });

  it("3. 短縮URL（youtu.be）", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("4. 短縮URL（クエリパラメータ付き）", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=30")).toBe("dQw4w9WgXcQ");
  });

  it("5. 埋め込みURL（embed）", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("6. ショートURL", () => {
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("7. 無効なURL", () => {
    expect(extractYouTubeId("https://example.com/video")).toBeNull();
  });

  it("8. YouTube URLだがIDなし", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch")).toBeNull();
  });

  it("9. 空文字", () => {
    expect(extractYouTubeId("")).toBeNull();
  });

  it("10. IDが11文字未満", () => {
    expect(extractYouTubeId("https://youtu.be/abc")).toBeNull();
  });
});

describe("fetchYouTubeInfo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("1. 正常取得", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ title: "テスト動画" }),
    } as Response);

    const result = await fetchYouTubeInfo("abc123xxxxx");
    expect(result).toEqual({
      title: "テスト動画",
      thumbnailUrl: "https://i.ytimg.com/vi/abc123xxxxx/hqdefault.jpg",
    });
  });

  it("2. oEmbed が 404 を返す", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(fetchYouTubeInfo("abc123xxxxx")).rejects.toThrow();
  });

  it("3. サムネイルURLの組み立て", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ title: "テスト" }),
    } as Response);

    const result = await fetchYouTubeInfo("testId12345");
    expect(result.thumbnailUrl).toBe("https://i.ytimg.com/vi/testId12345/hqdefault.jpg");
  });
});
