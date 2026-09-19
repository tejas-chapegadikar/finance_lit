import { LessonForm } from "@/components/admin/LessonForm";
import { createLesson } from "@/actions/admin-lessons";

export default function NewLessonPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New lesson</h1>
      <LessonForm onSubmit={createLesson} />
    </div>
  );
}
