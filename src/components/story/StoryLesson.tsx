"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Story } from "@/lib/story/types";
import { guideHide, guideSay } from "@/lib/guide/bus";
import { STORY } from "@/content/buddy-messages";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { primaryButton } from "@/components/ui/button-styles";
import { ArrowRightIcon } from "@/components/ui/icons";
import { StoryStage, buildTimeline } from "./StoryStage";

// A lesson told as a story that plays as you scroll. A pinned stage (CSS
// sticky, so it never jumps on phones) sits inside a tall section; scrolling
// through the section scrubs the story's timeline forward, scrolling back
// plays it backwards. Native scrolling only: nothing hijacks the wheel or
// touch, nothing snaps. Your place is saved. The quiz button appears once
// you're 95% through. Reduced motion: the same scenes as simple cards.

const SCROLL_PER_SCENE = 85; // svh of scrolling per scene
const QUIZ_AT = 0.95;

const calmNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.calm === "1";
const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
};

type QuizProps = { startQuiz: () => Promise<void>; xpReward: number; completed: boolean };

function QuizButton({ startQuiz, xpReward, completed }: QuizProps) {
  return (
    <form action={startQuiz} className="flex flex-col items-center gap-2">
      <SubmitButton pendingLabel="Starting…" className={`${primaryButton} px-8 py-4 text-base shadow-[0_10px_24px_-10px_rgb(15_31_24/0.6)]`}>
        {completed ? "Retake Quiz" : "Start Quiz"}
        <ArrowRightIcon className="h-5 w-5" />
      </SubmitButton>
      <p className="text-sm font-semibold text-slate-700">{completed ? "5 questions · raise your readiness" : `5 questions · +${xpReward} XP`}</p>
    </form>
  );
}

/** Reduced motion: every scene as a still card (the scene's last moment), with its caption. */
function StoryCards({ story, ...quiz }: { story: Story } & QuizProps) {
  const svgs = useRef<(SVGSVGElement | null)[]>([]);
  useEffect(() => {
    const timelines = svgs.current.map((svg, i) => {
      if (!svg) return null;
      const tl = buildTimeline(svg, story);
      tl.progress(Math.min(1, (i + 0.96) / story.scenes.length));
      return tl;
    });
    return () => timelines.forEach((tl) => tl?.kill());
  }, [story]);

  return (
    <ol className="mx-auto flex max-w-[480px] flex-col gap-4 px-4 py-2" aria-label="The story">
      {story.scenes.map((scene, i) => (
        <li key={i} className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
          <p className="px-5 pt-5 font-display text-xl leading-snug font-bold text-slate-900">{scene.caption}</p>
          <StoryStage
            story={story}
            ref={(el) => {
              svgs.current[i] = el;
            }}
            className="block aspect-[360/540] w-full"
          />
        </li>
      ))}
      <li className="flex justify-center py-6">
        <QuizButton {...quiz} />
      </li>
    </ol>
  );
}

export function StoryLesson({ story, ...quiz }: { story: Story } & QuizProps) {
  const [calm, setCalm] = useState(false);
  const [quizReady, setQuizReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const captions = useRef<(HTMLLIElement | null)[]>([]);
  const posKey = `rupli-story-${story.slug}`;
  const nudgeKey = `rupli-story-nudged-${story.slug}`;

  useEffect(() => {
    if (!calmNow()) return;
    const id = window.setTimeout(() => setCalm(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (calm || calmNow() || !root.current || !stage.current || !svg.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const rootEl = root.current;
    const stageEl = stage.current;
    const stageTop = () => parseFloat(getComputedStyle(stageEl).top) || 0;
    let progress = 0;
    let lastMove = Date.now();
    let lastSave = 0;
    let started = false;
    let quizSaid = false;
    let ready = false;
    let hintTimer = 0;
    let frame = 0;

    const ctx = gsap.context(() => {
      const tl = buildTimeline(svg.current!, story, captions.current);
      const trigger = ScrollTrigger.create({
        trigger: rootEl,
        start: () => `top ${stageTop()}px`,
        end: () => `bottom ${stageTop() + stageEl.offsetHeight}px`,
        animation: tl,
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          lastMove = Date.now();
          if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
          if (hint.current) hint.current.style.opacity = progress < 0.03 ? "1" : "0";
          if (!started && progress > 0.05) {
            started = true;
            guideHide("story");
          }
          if (progress >= QUIZ_AT !== ready) {
            ready = progress >= QUIZ_AT;
            setQuizReady(ready);
          }
          if (!quizSaid && progress >= 0.9) {
            quizSaid = true;
            guideSay({ kind: "help", tag: "story-quiz", text: STORY.quiz[0], expression: "smirk" });
          }
          if (Date.now() - lastSave > 400) {
            lastSave = Date.now();
            write(posKey, progress.toFixed(3));
          }
        },
      });

      // Back where you left off (mid-story only).
      const saved = Number(read(posKey));
      frame = requestAnimationFrame(() => {
        if (saved > 0.03 && saved < 0.97) {
          window.scrollTo({ top: trigger.start + saved * (trigger.end - trigger.start), behavior: "instant" });
          started = saved > 0.05;
        }
        if (!started) hintTimer = window.setTimeout(() => guideSay({ kind: "help", tag: "story", text: STORY.start[0], expression: "happy" }), 700);
      });
    }, rootEl);

    // Stopped scrolling for 6s mid-story: one nudge per lesson, ever.
    const idle = window.setInterval(() => {
      if (!started || progress >= QUIZ_AT || Date.now() - lastMove < 6000 || read(nudgeKey)) return;
      write(nudgeKey, "1");
      guideSay({ kind: "help", tag: "story", text: STORY.nudge[0], expression: "smirk" });
    }, 1000);

    return () => {
      window.clearInterval(idle);
      window.clearTimeout(hintTimer);
      cancelAnimationFrame(frame);
      ctx.revert();
      guideHide("story");
      guideHide("story-quiz");
    };
  }, [calm, story, posKey, nudgeKey]);

  return (
    <div className="story -mx-4 sm:-mx-6 lg:-mx-8">
      {calm ? (
        <StoryCards story={story} {...quiz} />
      ) : (
        <div ref={root} className="relative" style={{ height: `calc(var(--story-h) + ${story.scenes.length * SCROLL_PER_SCENE}svh)` }}>
          <div ref={stage} className="sticky top-[var(--story-top)] mx-auto flex h-[var(--story-h)] max-w-[480px] flex-col overflow-hidden bg-[#F5EFE3]">
            <div className="h-1.5 w-full bg-[#0F1F18]/10" role="progressbar" aria-label="Story progress">
              <div ref={bar} className="h-full w-full origin-left bg-[#FFB81F]" style={{ transform: "scaleX(0)" }} />
            </div>
            <ol aria-label="The story" className="relative h-[clamp(5.5rem,17svh,8.5rem)] shrink-0">
              {story.scenes.map((scene, i) => (
                <li
                  key={i}
                  ref={(el) => {
                    captions.current[i] = el;
                  }}
                  style={i > 0 ? { opacity: 0 } : undefined}
                  className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-center font-display text-[clamp(1.35rem,5.8vw,1.8rem)] leading-tight font-bold text-[#0F1F18]"
                >
                  {scene.caption}
                </li>
              ))}
            </ol>
            <StoryStage ref={svg} story={story} className="block min-h-0 w-full flex-1" />
            {/* Scroll hint: a bouncing arrow at the start */}
            <div ref={hint} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-opacity duration-300">
              <span className="story-bounce flex h-10 w-10 items-center justify-center rounded-full bg-[#0F1F18] text-[#F5EFE3] shadow-lg">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </span>
            </div>
            {/* The way out: the existing quiz, once the story is nearly done */}
            <div
              className={`absolute inset-x-0 top-[34%] flex justify-center transition-[opacity,transform] duration-300 ${quizReady ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
              inert={!quizReady}
            >
              <QuizButton {...quiz} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
