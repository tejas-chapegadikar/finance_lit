"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Where an avatar should look: towards the pointer, from -1 to 1 on each axis,
 * measured from the centre of `ref` (a third of the way down — about where
 * the eyes are). One update per frame at most.
 */
export function usePointerGaze(ref: RefObject<HTMLElement | null>) {
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let frame = 0;
    function move(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        const dx = (e.clientX - (box.left + box.width / 2)) / (window.innerWidth / 2);
        const dy = (e.clientY - (box.top + box.height / 3)) / (window.innerHeight / 2);
        setGaze({
          x: Math.max(-1, Math.min(1, dx)),
          y: Math.max(-1, Math.min(1, dy)),
        });
      });
    }
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
  return gaze;
}
