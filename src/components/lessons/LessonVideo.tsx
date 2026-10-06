"use client";

import { useCallback, useState } from "react";

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
 * one delivery shape. A file that fails to load (e.g. a placeholder URL
 * before the real video is uploaded) falls back to a note instead of a
 * broken black player — the written lesson below still teaches everything.
 */
export function LessonVideo({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const embedUrl = getEmbedUrl(url);

  // The browser starts loading the server-rendered <video> before React
  // hydrates, so a fast failure can fire before onError is attached — check
  // for an error that already happened when the element attaches.
  const detectEarlyError = useCallback((node: HTMLVideoElement | null) => {
    if (node?.error) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-violet-100 to-orange-50 p-6 text-center ring-1 ring-violet-900/5">
        <span aria-hidden className="text-4xl">
          🎬
        </span>
        <p className="font-bold text-neutral-900">The video for this lesson is coming soon</p>
        <p className="max-w-sm text-sm text-neutral-600">
          Everything you need is in the written lesson below — and the quiz after it.
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-3xl bg-neutral-900">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Lesson video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          key={url}
          ref={detectEarlyError}
          src={url}
          controls
          preload="metadata"
          onError={() => setFailed(true)}
          className="h-full w-full"
        />
      )}
    </div>
  );
}
