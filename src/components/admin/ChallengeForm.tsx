"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { challengeSchema, type ChallengeInput } from "@/lib/validations/challenge";
import { OPTIONS_PER_QUESTION } from "@/lib/constants";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "@/lib/readiness-areas";
import { Field, FormSection, adminInput } from "./form-parts";

export function ChallengeForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: ChallengeInput;
  onSubmit: (input: ChallengeInput) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ChallengeInput>({ resolver: zodResolver(challengeSchema), defaultValues });
  const options = useWatch({ control, name: "options" });

  function submit(data: ChallengeInput) {
    startTransition(async () => {
      try {
        await onSubmit(data);
        toast.success("Challenge saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save challenge");
      }
    });
  }

  const optionsError = errors.options?.message ?? errors.options?.root?.message;

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <FormSection title="Challenge" hint="A short real-life situation. Students get +25 XP for answering, right or wrong.">
        <Field label="Scenario / question" error={errors.prompt?.message}>
          <textarea {...register("prompt")} rows={3} className={adminInput} />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Options (select the correct one)</span>
          {Array.from({ length: OPTIONS_PER_QUESTION }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="challenge-correct"
                aria-label={`Option ${i + 1} is correct`}
                checked={options?.[i]?.isCorrect === true}
                onChange={() => {
                  for (let j = 0; j < OPTIONS_PER_QUESTION; j++) {
                    setValue(`options.${j}.isCorrect`, j === i, { shouldValidate: true });
                  }
                }}
              />
              <input
                {...register(`options.${i}.text`)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className={`${adminInput} flex-1`}
              />
            </div>
          ))}
          {optionsError && <p className="text-sm text-rose-700">{optionsError}</p>}
        </div>

        <Field label="Explanation (shown after answering)" error={errors.explanation?.message}>
          <textarea {...register("explanation")} rows={3} className={adminInput} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" error={errors.area?.message}>
            <select {...register("area")} className={adminInput}>
              {READINESS_AREA_VALUES.map((area) => (
                <option key={area} value={area}>
                  {READINESS_AREA_META[area].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order in the rotation" error={errors.order?.message}>
            <input type="number" {...register("order", { valueAsNumber: true })} className={adminInput} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" {...register("isPublished")} />
          Published (in the daily rotation)
        </label>
      </FormSection>

      <button
        type="submit"
        disabled={isPending}
        className="ml-auto rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save challenge"}
      </button>
    </form>
  );
}
