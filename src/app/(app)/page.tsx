import { Suspense } from "react";

import { createTaskAction } from "@/app/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { verifySession } from "@/lib/dal";
import { listActiveTasks } from "@/lib/tasks/store";

export default function Home() {
  return (
    <main className="flex flex-col gap-6">
      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">やることを追加</h2>
        <TaskForm action={createTaskAction} submitLabel="追加" />
      </section>
      {/* ログインの確認とデータの読み込みは Cookie を読むため、Suspense の中で行う */}
      <Suspense fallback={null}>
        <ActiveTasks />
      </Suspense>
    </main>
  );
}

async function ActiveTasks() {
  await verifySession();
  const tasks = await listActiveTasks();
  return <TaskList tasks={tasks} emptyMessage="やることはありません" />;
}
