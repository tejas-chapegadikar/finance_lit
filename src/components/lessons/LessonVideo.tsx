function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be") {
      const videoId =
        parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lesson videos may come from InVideo AI as a direct file export, or the
 * founder may re-host on YouTube/Vimeo — support both instead of assuming
 * one delivery shape.
 */
export function LessonVideo({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video key={url} src={url} controls preload="metadata" className="h-full w-full" />
      )}
    </div>
  );
}
