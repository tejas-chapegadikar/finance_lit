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
import { LessonVisual } from "@/components/lessons/LessonVisual";
import { LessonProgressBar, type LessonStep } from "@/components/lessons/LessonProgressBar";
import { StepLabel } from "@/components/lessons/StepLabel";
import { Markdown } from "@/components/ui/Markdown";
import { chapterOf } from "@/lib/journey";
import { PageHeader, MetaRow } from "@/components/ui/PageHeader";
import { IconTile, LessonIcon, ScenarioIcon } from "@/components/ui/topic-icons";
import { primaryButton, tile } from "@/components/ui/button-styles";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, LockIcon } from "@/components/ui/icons";

const STATUS_LABEL: Record<LessonStatus, string> = {
  completed: "Completed · retakes can raise your readiness but don't give XP",
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
  const level = chapterOf(lesson.slug);

  const header = (
    <PageHeader
      icon={
        <IconTile area={lesson.area} size="lg">
          <LessonIcon slug={lesson.slug} area={lesson.area} />
        </IconTile>
      }
      eyebrow={`${level ? `Level ${level.number} · ` : ""}Lesson ${number} · ${area.label}`}
      title={lesson.title}
    >
      <MetaRow
        items={[
          <>
            <ClockIcon className="h-4 w-4" />
            {lesson.estimatedMinutes} minutes
          </>,
          <span key="xp" className="font-semibold text-orange-700">
            +{lesson.xpReward} XP
          </span>,
          STATUS_LABEL[lessonProgress.status],
        ]}
      />
    </PageHeader>
  );

  const backLink = (
    <Link
      href="/lessons"
      className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Learning path
    </Link>
  );

  // Levels open in order: a locked lesson shows what it is, not its content.
  if (lessonProgress.locked) {
    const previous = progress.levels.find((l) => l.chapter.number === (level?.number ?? 1) - 1);
    const next = progress.next;
    return (
      <article className="mx-auto flex max-w-2xl flex-col gap-5">
        {backLink}
        <PageHeader
          icon={
            <IconTile size="lg" muted>
              <LessonIcon slug={lesson.slug} area={lesson.area} />
            </IconTile>
          }
          eyebrow={`Level ${level?.number} · Lesson ${number} · Locked`}
          title={lesson.title}
        />
        <section className="rounded-2xl border border-dashed border-slate-300 p-6 text-center sm:p-10" aria-labelledby="locked-heading">
          <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <LockIcon className="h-6 w-6" />
          </span>
          <h2 id="locked-heading" className="mt-4 text-2xl text-slate-900">
            This lesson is in Level {level?.number} — {level?.title}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">
            {previous
              ? `Finish Level ${previous.chapter.number} (${previous.completed}/${previous.slugs.length} lessons done) to unlock it. Levels open in order, so each one builds on the last.`
              : "Finish the previous level to unlock it."}
          </p>
          {next && (
            <Link href={`/lessons/${next.lesson.slug}`} className={`${primaryButton} mt-5`}>
              Continue with {next.lesson.title}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </section>
      </article>
    );
  }

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
    <article className="mx-auto flex max-w-2xl flex-col gap-8">
      {backLink}
      {header}
      <LessonProgressBar steps={steps} />

      <RecordLessonView lessonId={lesson.id} />

      {lesson.hook && (
        <section className="pt-2" aria-labelledby="hook-heading">
          <StepLabel id="hook-heading" step={stepNumber("hook-heading")} title="Think about it" />
          <div className="mt-5 border-l-[3px] border-brand-500 pl-5">
            <Markdown variant="plain" className="font-display text-[1.35rem] leading-snug text-slate-900 prose-p:my-2 sm:text-2xl">
              {lesson.hook}
            </Markdown>
          </div>
        </section>
      )}

      <section className="border-t border-slate-200 pt-8" aria-labelledby="learn-heading">
        <StepLabel id="learn-heading" step={stepNumber("learn-heading")} title="Learn" />
        <div className="mt-6 flex flex-col">
          {sections.map((section, i) => (
            <div key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-slate-200 py-6 first:pt-0 last:border-b-0 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
              <span aria-hidden className="pt-1 font-display text-sm font-semibold text-slate-400 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                {section.title && <h3 className="text-xl leading-snug text-slate-900">{section.title}</h3>}
                {section.body && <Markdown className={section.title ? "mt-2" : ""}>{section.body}</Markdown>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <LessonVisual slug={lesson.slug} />
        </div>
      </section>

      {lesson.example && (
        <section className="rounded-3xl bg-peach-100/70 p-6 sm:p-8" aria-labelledby="example-heading">
          <StepLabel id="example-heading" step={stepNumber("example-heading")} title="Real-life example" />
          <Markdown variant="plain" className="mt-4">
            {lesson.example}
          </Markdown>
        </section>
      )}

      {keyTerms.length > 0 && (
        <section className="pt-2" aria-labelledby="concepts-heading">
          <StepLabel id="concepts-heading" step={stepNumber("concepts-heading")} title="Key concepts" />
          <p className="mt-1.5 text-sm text-slate-600">The ideas to remember from this lesson.</p>
          <dl className="mt-5 grid gap-x-8 border-t border-slate-200 sm:grid-cols-2">
            {keyTerms.map((term) => (
              <div key={term.term} className="border-b border-slate-200 py-4">
                <dt className="font-semibold text-slate-900">{term.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600">{term.definition}</dd>
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
          className={`${tile} flex items-center gap-4 p-4`}
        >
          <IconTile area={practiceScenario.area} size="md">
            <ScenarioIcon slug={practiceScenario.slug} area={practiceScenario.area} />
          </IconTile>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-brand-700">Try it for real</span>
            <span className="block font-semibold text-slate-900">{practiceScenario.title}</span>
            <span className="block text-sm text-slate-600">An interactive scenario that puts this lesson into practice.</span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-700" />
        </Link>
      )}

      <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600" aria-label="Sources and review">
        <p className="font-semibold text-slate-900">Sources &amp; review</p>
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
