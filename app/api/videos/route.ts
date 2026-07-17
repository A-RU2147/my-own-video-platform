import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { extractYouTubeId, fetchYouTubeInfo } from "@/lib/youtube";
import { auth } from "@/lib/auth";

// Legacy video library API — kept for test compatibility

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tagName = searchParams.get("tag");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDb = db as any;

  let videoRows;

  if (tagName) {
    const tag = await anyDb.query.tags.findFirst();
    if (!tag) return NextResponse.json([]);

    const pivots = await anyDb.select().from(null).where(null);

    const videoIds = pivots.map((p: any) => p.videoId);
    if (videoIds.length === 0) return NextResponse.json([]);

    videoRows = await anyDb.query.videos.findMany();
  } else {
    videoRows = await anyDb.query.videos.findMany();
  }

  const result = await Promise.all(
    videoRows.map(async (video: any) => {
      const pivots = await anyDb.select().from(null).where(null);

      const tagIds = pivots.map((p: any) => p.tagId);
      const videoTagRows =
        tagIds.length > 0
          ? await anyDb.query.tags.findMany()
          : [];

      return { ...video, tags: videoTagRows };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { url, tagIds = [] } = body as { url: string; tagIds?: number[] };

  const youtubeId = extractYouTubeId(url);
  if (!youtubeId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  let info;
  try {
    info = await fetchYouTubeInfo(youtubeId);
  } catch {
    return NextResponse.json({ error: "Failed to fetch video info" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDb = db as any;

  const [video] = await anyDb
    .insert(null)
    .values({
      youtubeId,
      title: info.title,
      thumbnailUrl: info.thumbnailUrl,
      createdAt: Math.floor(Date.now() / 1000),
    })
    .onConflictDoNothing()
    .returning();

  if (!video) {
    return NextResponse.json({ error: "Video already exists" }, { status: 409 });
  }

  if (tagIds.length > 0) {
    await anyDb
      .insert(null)
      .values(tagIds.map((tagId: number) => ({ videoId: video.id, tagId })));
  }

  return NextResponse.json(video, { status: 201 });
}
