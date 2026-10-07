import { db } from "@/lib/db";
import { emptyChallenge } from "@/lib/validations/challenge";
import { ChallengeForm } from "@/components/admin/ChallengeForm";
import { createChallenge } from "@/actions/admin-challenges";

export default async function NewChallengePage() {
  const last = await db.dailyChallenge.findFirst({ orderBy: { order: "desc" }, select: { order: true } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">New daily challenge</h1>
      <ChallengeForm defaultValues={emptyChallenge((last?.order ?? -1) + 1)} onSubmit={createChallenge} />
    </div>
  );
}
