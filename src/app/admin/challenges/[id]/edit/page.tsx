import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { readChoiceOptions } from "@/lib/lesson-content";
import { OPTIONS_PER_QUESTION } from "@/lib/constants";
import { ChallengeForm } from "@/components/admin/ChallengeForm";
import { updateChallenge } from "@/actions/admin-challenges";

export default async function EditChallengePage(props: PageProps<"/admin/challenges/[id]/edit">) {
  const { id } = await props.params;
  const challenge = await db.dailyChallenge.findUnique({ where: { id } });
  if (!challenge) {
    notFound();
  }

  const options = readChoiceOptions(challenge.options);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit daily challenge</h1>
      <ChallengeForm
        defaultValues={{
          prompt: challenge.prompt,
          area: challenge.area,
          options: Array.from({ length: OPTIONS_PER_QUESTION }, (_, i) => options[i] ?? { text: "", isCorrect: false }),
          explanation: challenge.explanation,
          isPublished: challenge.isPublished,
          order: challenge.order,
        }}
        onSubmit={updateChallenge.bind(null, challenge.id)}
      />
    </div>
  );
}
