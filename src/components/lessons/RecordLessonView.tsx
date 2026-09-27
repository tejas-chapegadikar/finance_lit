"use client";

import { useEffect } from "react";
import { recordLessonView } from "@/actions/lessons";

// Recorded from a client effect rather than during the page's server render,
// because <Link> prefetching can render lesson pages the student never
// actually opened — that would inflate "videos watched".
export function RecordLessonView({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    recordLessonView(lessonId).catch(() => {});
  }, [lessonId]);

  return null;
}
