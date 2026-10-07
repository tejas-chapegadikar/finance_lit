"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

// Keeps the navbar and tab bar on screen when an app page fails.
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState retry={retry} />;
}
