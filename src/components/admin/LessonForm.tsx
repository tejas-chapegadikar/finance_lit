"use client";

import { useTransition } from "react";
import { useFieldArray, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { lessonSchema, type LessonInput } from "@/lib/validations/lesson";
import { DIFFICULTY_VALUES } from "@/lib/validations/question";
import { QUESTIONS_PER_QUIZ, OPTIONS_PER_QUESTION, XP_REWARD_DEFAULT } from "@/lib/constants";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "@/lib/readiness-areas";
import { Field, FormSection, adminInput } from "./form-parts";

function emptyOptions() {
  return Array.from({ length: OPTIONS_PER_QUESTION }, () => ({ text: "", isCorrect: false }));
}

function emptyLesson(): LessonInput {
  return {
    slug: "",
    title: "",
    icon: "📘",
    area: "BUDGETING",
    description: "",
    hook: "",
    contentMarkdown: "",
    keyTerms: [{ term: "", definition: "" }],
    example: "",
    scenarioPrompt: "",
    scenarioOptions: emptyOptions(),
    scenarioExplanation: "",
    estimatedMinutes: 5,
    xpReward: XP_REWARD_DEFAULT,
    isPublished: false,
    order: 0,
    questions: Array.from({ length: QUESTIONS_PER_QUIZ }, () => ({
      prompt: "",
      explanation: "",
      hint: "",
      difficulty: "MEDIUM" as const,
      options: emptyOptions(),
    })),
  };
}

type OptionsBase = "scenarioOptions" | `questions.${number}.options`;

export function LessonForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: LessonInput;
  onSubmit: (input: LessonInput) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: defaultValues ?? emptyLesson(),
  });
  const keyTerms = useFieldArray({ control, name: "keyTerms" });
  const scenarioOptions = useWatch({ control, name: "scenarioOptions" });
  const questions = useWatch({ control, name: "questions" });

  function isCorrectAt(base: OptionsBase, i: number) {
    const options = base === "scenarioOptions" ? scenarioOptions : questions?.[Number(base.split(".")[1])]?.options;
    return options?.[i]?.isCorrect === true;
  }

  function submit(data: LessonInput) {
    startTransition(async () => {
      try {
        await onSubmit(data);
        toast.success("Lesson saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save lesson");
      }
    });
  }

  // Four option rows with a radio for the correct one — used by the scenario
  // and by every quiz question.
  function optionsEditor(base: OptionsBase, groupName: string, error?: string) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-700">Options (select the correct one)</span>
        {Array.from({ length: OPTIONS_PER_QUESTION }).map((_, oIndex) => (
          <div key={oIndex} className="flex items-center gap-2">
            <input
              type="radio"
              name={groupName}
              aria-label={`Option ${oIndex + 1} is correct`}
              checked={isCorrectAt(base, oIndex)}
              onChange={() => {
                for (let i = 0; i < OPTIONS_PER_QUESTION; i++) {
                  setValue(`${base}.${i}.isCorrect` as Path<LessonInput>, i === oIndex, { shouldValidate: true });
                }
              }}
            />
            <input
              {...register(`${base}.${oIndex}.text` as Path<LessonInput>)}
              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
              className={`${adminInput} flex-1`}
            />
          </div>
        ))}
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    );
  }

  const scenarioOptionsError = errors.scenarioOptions?.message ?? errors.scenarioOptions?.root?.message;

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <FormSection title="Lesson details">
        <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
          <Field label="Title" error={errors.title?.message}>
            <input {...register("title")} className={adminInput} />
          </Field>
          <Field label="Icon" error={errors.icon?.message}>
            <input {...register("icon")} className={`${adminInput} text-center text-xl`} />
          </Field>
        </div>

        <Field label="Slug (lowercase-hyphenated, used in the URL)" error={errors.slug?.message}>
          <input {...register("slug")} className={adminInput} />
        </Field>

        <Field label="Category (the readiness area this lesson builds)" error={errors.area?.message}>
          <select {...register("area")} className={adminInput}>
            {READINESS_AREA_VALUES.map((area) => (
              <option key={area} value={area}>
                {READINESS_AREA_META[area].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Short description (shown on cards)" error={errors.description?.message}>
          <textarea {...register("description")} rows={2} className={adminInput} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Est. minutes" error={errors.estimatedMinutes?.message}>
            <input type="number" {...register("estimatedMinutes", { valueAsNumber: true })} className={adminInput} />
          </Field>
          <Field label="XP reward" error={errors.xpReward?.message}>
            <input type="number" {...register("xpReward", { valueAsNumber: true })} className={adminInput} />
          </Field>
          <Field label="Order" error={errors.order?.message}>
            <input type="number" {...register("order", { valueAsNumber: true })} className={adminInput} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" {...register("isPublished")} />
          Published (visible to students)
        </label>
      </FormSection>

      <FormSection title="Part 1 — Hook" hint="A short, relatable situation that gets the student thinking. End with a question.">
        <Field label="Hook" error={errors.hook?.message}>
          <textarea {...register("hook")} rows={3} className={adminInput} />
        </Field>
      </FormSection>

      <FormSection
        title="Part 2 — Learn"
        hint='Markdown. Each "## Heading" becomes its own card. Keep paragraphs short; **bold** highlights a term.'
      >
        <Field label="Lesson content" error={errors.contentMarkdown?.message}>
          <textarea {...register("contentMarkdown")} rows={14} className={`${adminInput} font-mono text-xs`} />
        </Field>
      </FormSection>

      <FormSection title="Important terms" hint="Shown in the lesson and on the completion screen.">
        {keyTerms.fields.map((field, i) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-start">
            <div className="sm:w-48">
              <input {...register(`keyTerms.${i}.term`)} placeholder="Term" className={`${adminInput} w-full`} />
              {errors.keyTerms?.[i]?.term && (
                <p className="mt-1 text-sm text-rose-700">{errors.keyTerms[i]?.term?.message}</p>
              )}
            </div>
            <div className="flex-1">
              <input
                {...register(`keyTerms.${i}.definition`)}
                placeholder="Plain-language definition"
                className={`${adminInput} w-full`}
              />
              {errors.keyTerms?.[i]?.definition && (
                <p className="mt-1 text-sm text-rose-700">{errors.keyTerms[i]?.definition?.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => keyTerms.remove(i)}
              disabled={keyTerms.fields.length <= 1}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
        {(errors.keyTerms?.message ?? errors.keyTerms?.root?.message) && (
          <p className="text-sm text-rose-700">{errors.keyTerms?.message ?? errors.keyTerms?.root?.message}</p>
        )}
        <button
          type="button"
          onClick={() => keyTerms.append({ term: "", definition: "" })}
          disabled={keyTerms.fields.length >= 10}
          className="self-start rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100 disabled:opacity-40"
        >
          + Add term
        </button>
      </FormSection>

      <FormSection title="Real-life example" hint="An Indian example with real ₹ numbers. Markdown; end with a question.">
        <Field label="Example" error={errors.example?.message}>
          <textarea {...register("example")} rows={7} className={`${adminInput} font-mono text-xs`} />
        </Field>
      </FormSection>

      <FormSection title="Mini scenario — “What would you do?”" hint="Answered before the quiz, with instant feedback.">
        <Field label="Scenario" error={errors.scenarioPrompt?.message}>
          <textarea {...register("scenarioPrompt")} rows={3} className={adminInput} />
        </Field>
        {optionsEditor("scenarioOptions", "scenario-correct", scenarioOptionsError)}
        <Field label="Explanation (shown after answering)" error={errors.scenarioExplanation?.message}>
          <textarea {...register("scenarioExplanation")} rows={3} className={adminInput} />
        </Field>
      </FormSection>

      {Array.from({ length: QUESTIONS_PER_QUIZ }).map((_, qIndex) => {
        const qErrors = errors.questions?.[qIndex];
        return (
          <FormSection key={qIndex} title={`Question ${qIndex + 1}`}>
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <Field label="Question" error={qErrors?.prompt?.message}>
                <input {...register(`questions.${qIndex}.prompt`)} className={adminInput} />
              </Field>
              <Field label="Difficulty" error={qErrors?.difficulty?.message}>
                <select {...register(`questions.${qIndex}.difficulty`)} className={adminInput}>
                  {DIFFICULTY_VALUES.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0) + d.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {optionsEditor(
              `questions.${qIndex}.options`,
              `q${qIndex}-correct`,
              qErrors?.options?.message ?? qErrors?.options?.root?.message,
            )}

            <Field label="Explanation (shown after answering)" error={qErrors?.explanation?.message}>
              <textarea {...register(`questions.${qIndex}.explanation`)} rows={2} className={adminInput} />
            </Field>
            <Field
              label="Hint (shown when the AI Coach is unavailable — don't give the answer away)"
              error={qErrors?.hint?.message}
            >
              <textarea {...register(`questions.${qIndex}.hint`)} rows={2} className={adminInput} />
            </Field>
          </FormSection>
        );
      })}

      <button
        type="submit"
        disabled={isPending}
        className="sticky bottom-4 ml-auto rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save lesson"}
      </button>
    </form>
  );
}
