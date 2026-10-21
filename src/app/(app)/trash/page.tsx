import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { TrashItemActions } from "@/components/tasks/trash-item-actions";
import { verifySession } from "@/lib/dal";
import { listTrashedTasks } from "@/lib/tasks/store";

export const metadata: Metadata = {
  title: "ゴミ箱 | todo",
};

export default function TrashPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <TrashedTasks />
      </Suspense>
    </main>
  );
}

async function TrashedTasks() {
  await verifySession();
  const tasks = await listTrashedTasks();

  if (tasks.length === 0) {
    return <EmptyState>ゴミ箱は空です</EmptyState>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {tasks.map((task) => (
        <li key={task.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
          <span className="min-w-0 flex-1 break-words text-muted-foreground">
            {task.title}
            {task.completedAt && <span className="ml-2 text-xs">（完了済み）</span>}
          </span>
          <TrashItemActions id={task.id} title={task.title} />
        </li>
      ))}
    </ul>
  );
}
