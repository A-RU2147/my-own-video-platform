export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export interface YouTubeInfo {
  title: string;
  thumbnailUrl: string;
}

export async function fetchYouTubeInfo(youtubeId: string): Promise<YouTubeInfo> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch YouTube info for ${youtubeId}`);
  }
  const data = await res.json();
  return {
    title: data.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
  };
}
