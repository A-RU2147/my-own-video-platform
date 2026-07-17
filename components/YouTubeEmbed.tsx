"use client";

interface Props {
  youtubeId: string;
  title: string;
}

export function YouTubeEmbed({ youtubeId, title }: Props) {
  return (
    <div className="relative aspect-video w-full">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-xl"
      />
    </div>
  );
}
