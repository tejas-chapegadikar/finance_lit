import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProgress, type LessonStatus } from "@/lib/progress";
import { READINESS_AREA_META } from "@/lib/readiness-areas";
import { readChoiceOptions, readKeyTerms, readSources, splitLearnSections } from "@/lib/lesson-content";
import { CORE_SCENARIOS } from "@/lib/scenarios";
import { answerScenario } from "@/actions/lessons";
import { beginQuiz } from "@/actions/quiz";
import { RecordLessonView } from "@/components/lessons/RecordLessonView";
import { LessonFinale } from "@/components/lessons/LessonFinale";
import { LessonProgressBar, type LessonStep } from "@/components/lessons/LessonProgressBar";
import { StepLabel } from "@/components/lessons/StepLabel";
import { Markdown } from "@/components/ui/Markdown";
import { card, heroChip, heroSurface, tile } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon } from "@/components/ui/icons";

const STATUS_LABEL: Record<LessonStatus, string> = {
  completed: "✅ Completed — retakes can raise your readiness but don't give XP",
  "in-progress": "In progress",
  "not-started": "Not started",
};

export async function generateMetadata(props: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const lesson = await db.lesson.findUnique({ where: { slug }, select: { title: true } });
  return { title: lesson ? `${lesson.title} — StockStreak` : "Lesson — StockStreak" };
}

export default async function LessonPage(props: PageProps<"/lessons/[slug]">) {
  const user = await requireOnboardedUser();
  const { slug } = await props.params;

  const [lesson, progress] = await Promise.all([
    db.lesson.findUnique({ where: { slug } }),
    getProgress(user.id),
  ]);
  const lessonProgress = progress.lessons.find((l) => l.id === lesson?.id);
  if (!lesson || !lesson.isPublished || !lessonProgress) {
    notFound();
  }

  const area = READINESS_AREA_META[lesson.area];
  const number = String(lessonProgress.number).padStart(2, "0");

  const header = (
    <header className={`${heroSurface} relative overflow-hidden p-6 sm:p-8`}>
      <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-white/5" />
      <p className="relative">
        <span className={heroChip}>
          Lesson {number} · {area.label}
        </span>
      </p>
      <div className="relative mt-4 flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-[0_4px_0_0_var(--color-brand-800)]"
        >
          {lesson.icon}
        </span>
        <h1 className="min-w-0 text-2xl leading-tight font-extrabold sm:text-3xl">{lesson.title}</h1>
      </div>
      <ul className="relative mt-4 flex flex-wrap gap-2">
        <li className={heroChip}>
          <ClockIcon className="h-4 w-4" />
          {lesson.estimatedMinutes} minutes
        </li>
        <li className={heroChip}>
          <span aria-hidden>⭐</span>+{lesson.xpReward} XP
        </li>
        <li className={heroChip}>{STATUS_LABEL[lessonProgress.status]}</li>
      </ul>
    </header>
  );

  const backLink = (
    <Link
      href="/lessons"
      className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      All lessons
    </Link>
  );

  const sections = splitLearnSections(lesson.contentMarkdown);
  const sources = readSources(lesson.sources);
  const practiceScenario = CORE_SCENARIOS.find((s) => s.lessonSlug === lesson.slug);
  const keyTerms = readKeyTerms(lesson.keyTerms);
  const scenarioOptions = readChoiceOptions(lesson.scenarioOptions);
  const scenario =
    lesson.scenarioPrompt && scenarioOptions.length > 0
      ? { prompt: lesson.scenarioPrompt, options: scenarioOptions.map((o) => o.text) }
      : null;

  const previousAnswer = scenario
    ? await db.scenarioAnswer.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } } })
    : null;
  const initialAnswer =
    previousAnswer && scenarioOptions[previousAnswer.optionIndex]
      ? {
          pickedIndex: previousAnswer.optionIndex,
          isCorrect: previousAnswer.isCorrect,
          correctIndex: scenarioOptions.findIndex((o) => o.isCorrect),
          explanation: lesson.scenarioExplanation,
        }
      : null;

  // The parts in the order the student meets them; empty parts are skipped.
  // Each id is that part's heading, which the progress bar tracks.
  const steps: LessonStep[] = [
    ...(lesson.hook ? [{ id: "hook-heading", title: "Think about it" }] : []),
    { id: "learn-heading", title: "Learn" },
    ...(lesson.example ? [{ id: "example-heading", title: "Real-life example" }] : []),
    ...(keyTerms.length > 0 ? [{ id: "concepts-heading", title: "Key concepts" }] : []),
    ...(scenario ? [{ id: "scenario-heading", title: "What would you do?" }] : []),
    { id: "quiz-heading", title: "Quiz" },
  ];
  const stepNumber = (id: string) => steps.findIndex((step) => step.id === id) + 1;

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-5">
      {backLink}
      {header}
      <LessonProgressBar steps={steps} />

      <RecordLessonView lessonId={lesson.id} />

      {lesson.hook && (
        <section className={`${card} p-5 sm:p-6`} aria-labelledby="hook-heading">
          <StepLabel id="hook-heading" step={stepNumber("hook-heading")} title="Think about it" icon="💭" />
          <div className="mt-4 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-100">
            <Markdown variant="plain" className="text-lg font-semibold text-slate-900 prose-p:my-2">
              {lesson.hook}
            </Markdown>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="learn-heading">
        <StepLabel id="learn-heading" step={stepNumber("learn-heading")} title="Learn" icon="📖" />
        {sections.map((section, i) => (
          <div key={i} className={`${card} p-5 sm:p-6`}>
            {section.title && (
              <h3 className="flex items-start gap-2 text-lg font-bold text-slate-900">
                <span className="mt-0.5 rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-extrabold text-brand-700">
                  {i + 1}/{sections.length}
                </span>
                {section.title}
              </h3>
            )}
            {section.body && <Markdown className="mt-2">{section.body}</Markdown>}
          </div>
        ))}
      </section>

      {lesson.example && (
        <section
          className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200 shadow-[0_4px_0_0_var(--color-amber-200)] sm:p-6"
          aria-labelledby="example-heading"
        >
          <StepLabel id="example-heading" step={stepNumber("example-heading")} title="Real-life example" icon="📍" />
          <Markdown variant="plain" className="mt-3">
            {lesson.example}
          </Markdown>
        </section>
      )}

      {keyTerms.length > 0 && (
        <section className={`${card} p-5 sm:p-6`} aria-labelledby="concepts-heading">
          <StepLabel id="concepts-heading" step={stepNumber("concepts-heading")} title="Key concepts" icon="📌" />
          <p className="mt-1 text-sm text-slate-600">The ideas to remember from this lesson.</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {keyTerms.map((term) => (
              <div
                key={term.term}
                className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 shadow-[0_3px_0_0_var(--color-brand-100)]"
              >
                <dt className="font-bold text-brand-800">{term.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-700">{term.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <LessonFinale
        scenario={scenario}
        answerScenario={answerScenario.bind(null, lesson.id)}
        initialAnswer={initialAnswer}
        startQuiz={beginQuiz.bind(null, lesson.id)}
        xpReward={lesson.xpReward}
        alreadyCompleted={lessonProgress.status === "completed"}
        scenarioStep={stepNumber("scenario-heading")}
        quizStep={stepNumber("quiz-heading")}
      />

      {practiceScenario && (
        <Link
          href={`/practice/${practiceScenario.slug}`}
          className={`${tile} flex items-center gap-4 p-4 transition hover:-translate-y-0.5`}
        >
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
            {practiceScenario.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-wider text-brand-700 uppercase">Try it for real</span>
            <span className="block font-extrabold text-slate-900">{practiceScenario.title}</span>
            <span className="block text-sm text-slate-600">An interactive scenario that puts this lesson into practice.</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-700" />
        </Link>
      )}

      <footer className="rounded-2xl bg-white/70 p-4 text-sm text-slate-600 ring-1 ring-slate-200" aria-label="Sources and review">
        <p className="font-bold text-slate-800">Sources &amp; review</p>
        {lesson.reviewedAt && (
          <p className="mt-1">
            Last reviewed:{" "}
            {lesson.reviewedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}
          </p>
        )}
        {lesson.appliesTo && <p className="mt-1">Applies to: {lesson.appliesTo}</p>}
        {sources.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs">
          Examples use illustrative numbers — your own situation may differ. This is education, not personal financial advice.
        </p>
      </footer>
    </article>
  );
}
