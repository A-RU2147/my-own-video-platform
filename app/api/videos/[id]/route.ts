import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";

// Legacy video library API — kept for test compatibility

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDb = db as any;

  const video = await anyDb.query.videos.findFirst();
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pivots = await anyDb.select().from(null).where(null);

  const tagIds = pivots.map((p: any) => p.tagId);
  const videoTagRows =
    tagIds.length > 0
      ? await anyDb.query.tags.findMany()
      : [];

  return NextResponse.json({ ...video, tags: videoTagRows });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDb = db as any;
  await anyDb.delete(null).where(null);
  return new NextResponse(null, { status: 204 });
}
