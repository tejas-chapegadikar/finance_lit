"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { lessonSchema, type LessonInput } from "@/lib/validations/lesson";
import { QUESTIONS_PER_QUIZ, OPTIONS_PER_QUESTION, XP_REWARD_DEFAULT } from "@/lib/constants";
import { READINESS_AREA_META, READINESS_AREA_VALUES } from "@/lib/readiness-areas";

const inputClass = "rounded-md border border-neutral-300 px-3 py-2 text-sm";

function emptyQuestion() {
  return {
    prompt: "",
    explanation: "",
    options: Array.from({ length: OPTIONS_PER_QUESTION }, () => ({
      text: "",
      isCorrect: false,
    })),
  };
}

function emptyLesson(): LessonInput {
  return {
    slug: "",
    title: "",
    topic: "",
    area: "BUDGETING",
    description: "",
    contentMarkdown: "",
    videoUrl: "",
    estimatedMinutes: 5,
    xpReward: XP_REWARD_DEFAULT,
    isPublished: false,
    order: 0,
    questions: Array.from({ length: QUESTIONS_PER_QUIZ }, emptyQuestion),
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error && <span className="text-red-600">{error}</span>}
    </label>
  );
}

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
    formState: { errors },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: defaultValues ?? emptyLesson(),
  });

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

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4">
        <h2 className="font-semibold">Lesson details</h2>

        <Field label="Title" error={errors.title?.message}>
          <input {...register("title")} className={inputClass} />
        </Field>

        <Field label="Slug (lowercase-hyphenated)" error={errors.slug?.message}>
          <input {...register("slug")} className={inputClass} />
        </Field>

        <Field label="Topic" error={errors.topic?.message}>
          <input {...register("topic")} className={inputClass} />
        </Field>

        <Field label="Readiness area (which dashboard score this lesson builds)" error={errors.area?.message}>
          <select {...register("area")} className={inputClass}>
            {READINESS_AREA_VALUES.map((area) => (
              <option key={area} value={area}>
                {READINESS_AREA_META[area].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Short description" error={errors.description?.message}>
          <textarea {...register("description")} rows={2} className={inputClass} />
        </Field>

        <Field label="Video URL" error={errors.videoUrl?.message}>
          <input {...register("videoUrl")} className={inputClass} placeholder="https://..." />
        </Field>

        <Field label="Lesson content (Markdown)" error={errors.contentMarkdown?.message}>
          <textarea
            {...register("contentMarkdown")}
            rows={10}
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Est. minutes" error={errors.estimatedMinutes?.message}>
            <input
              type="number"
              {...register("estimatedMinutes", { valueAsNumber: true })}
              className={inputClass}
            />
          </Field>
          <Field label="XP reward" error={errors.xpReward?.message}>
            <input
              type="number"
              {...register("xpReward", { valueAsNumber: true })}
              className={inputClass}
            />
          </Field>
          <Field label="Order" error={errors.order?.message}>
            <input
              type="number"
              {...register("order", { valueAsNumber: true })}
              className={inputClass}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isPublished")} />
          Published (visible to students)
        </label>
      </section>

      {Array.from({ length: QUESTIONS_PER_QUIZ }).map((_, qIndex) => (
        <section
          key={qIndex}
          className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4"
        >
          <h2 className="font-semibold">Question {qIndex + 1}</h2>

          <Field label="Prompt" error={errors.questions?.[qIndex]?.prompt?.message}>
            <input {...register(`questions.${qIndex}.prompt`)} className={inputClass} />
          </Field>

          <Field
            label="Explanation (shown after answering)"
            error={errors.questions?.[qIndex]?.explanation?.message}
          >
            <textarea
              {...register(`questions.${qIndex}.explanation`)}
              rows={2}
              className={inputClass}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Options (select the correct one)</span>
            {Array.from({ length: OPTIONS_PER_QUESTION }).map((_, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`questions.${qIndex}.correct`}
                  defaultChecked={defaultValues?.questions[qIndex]?.options[oIndex]?.isCorrect}
                  onChange={() => {
                    for (let i = 0; i < OPTIONS_PER_QUESTION; i++) {
                      setValue(`questions.${qIndex}.options.${i}.isCorrect`, i === oIndex);
                    }
                  }}
                />
                <input
                  {...register(`questions.${qIndex}.options.${oIndex}.text`)}
                  placeholder={`Option ${oIndex + 1}`}
                  className={`${inputClass} flex-1`}
                />
              </div>
            ))}
            {errors.questions?.[qIndex]?.options && (
              <p className="text-sm text-red-600">
                {errors.questions[qIndex]?.options?.message ??
                  "Check the options for this question"}
              </p>
            )}
          </div>
        </section>
      ))}

      <button
        type="submit"
        disabled={isPending}
        className="ml-auto rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save lesson"}
      </button>
    </form>
  );
}
