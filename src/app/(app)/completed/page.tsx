import type { Metadata } from "next";
import { Suspense } from "react";

import { TaskList } from "@/components/tasks/task-list";
import { verifySession } from "@/lib/dal";
import { listCompletedTasks } from "@/lib/tasks/store";

export const metadata: Metadata = {
  title: "完了済み | todo",
};

export default function CompletedPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <CompletedTasks />
      </Suspense>
    </main>
  );
}

async function CompletedTasks() {
  await verifySession();
  const tasks = await listCompletedTasks();
  return <TaskList tasks={tasks} emptyMessage="完了したタスクはありません" />;
}
