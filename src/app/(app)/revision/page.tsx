import Link from "next/link";
import type { Metadata } from "next";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { istDay } from "@/lib/ist-date";
import { readChoiceOptions } from "@/lib/lesson-content";
import { REVISION_XP, revisionQuestion } from "@/lib/revision";
import { RevisionRunner, type RevisionCard } from "@/components/practice/RevisionRunner";
import { PageHeader, MetaRow } from "@/components/ui/PageHeader";
import { card, primaryButton } from "@/components/ui/button-styles";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Revision — StockStreak" };

// A session covers at most this many questions, so revision stays short.
const SESSION_SIZE = 8;

export default async function RevisionPage() {
  const user = await requireOnboardedUser();
  const items = await db.revisionItem.findMany({
    where: { userId: user.id, status: "ACTIVE", dueDay: { lte: istDay() } },
    orderBy: [{ dueDay: "asc" }, { createdAt: "asc" }],
    take: SESSION_SIZE,
    include: {
      lesson: { select: { title: true, icon: true } },
      question: { include: { options: { orderBy: { order: "asc" } } } },
    },
  });

  // Only option texts go to the browser; answers are checked on the server.
  const cards: RevisionCard[] = items.map((item) => {
    const question = revisionQuestion(item.question);
    return {
      itemId: item.id,
      lessonTitle: item.lesson.title,
      lessonIcon: item.lesson.icon,
      kind: item.kind,
      prompt: question.prompt,
      options: readChoiceOptions(question.options).map((o) => o.text),
    };
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <Link href="/lessons#review" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon className="h-4 w-4" />
        Learn
      </Link>
      <PageHeader
        eyebrow="Review & revise"
        title="Revision"
        description="Questions you missed come back after 1, 3 and 7 days, each time with a fresh example."
      >
        <MetaRow
          items={[
            cards.length ? `${cards.length} due today` : "Nothing due",
            <span key="xp" className="font-semibold text-orange-700">
              +{REVISION_XP} XP each
            </span>,
          ]}
        />
      </PageHeader>

      {cards.length ? (
        <RevisionRunner cards={cards} />
      ) : (
        <section className={`${card} p-8 text-center`}>
          <h2 className="text-xl font-extrabold text-slate-900">You&apos;re all caught up</h2>
          <p className="mx-auto mt-1 max-w-sm text-slate-600">
            Questions you miss in quizzes come back here after 1, 3 and 7 days, each time with a fresh example.
          </p>
          <Link href="/lessons#practise" className={`${primaryButton} mt-5`}>
            More ways to practise
          </Link>
        </section>
      )}
    </div>
  );
}
