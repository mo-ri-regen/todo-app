import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { moveTaskToTrashAction, updateTaskAction } from "@/app/actions/tasks";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/dal";
import { taskIdSchema } from "@/lib/tasks/schema";
import { getTask } from "@/lib/tasks/store";

export const metadata: Metadata = {
  title: "編集 | todo",
};

export default function EditTaskPage({ params }: PageProps<"/tasks/[id]">) {
  return (
    <main className="flex flex-col gap-4">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← 一覧に戻る
      </Link>
      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">タスクを編集</h2>
        {/* URL のパラメータとログインの確認は、Suspense の中で行う */}
        <Suspense fallback={null}>
          {params.then(({ id }) => (
            <EditTask id={id} />
          ))}
        </Suspense>
      </section>
    </main>
  );
}

async function EditTask({ id }: { id: string }) {
  await verifySession();

  const parsedId = taskIdSchema.safeParse(id);
  const task = parsedId.success ? await getTask(parsedId.data) : null;
  if (!task) notFound();

  const { title, dueDate, priority, memo } = task;
  return (
    <div className="flex flex-col gap-4">
      <TaskForm
        action={updateTaskAction.bind(null, task.id)}
        defaultValues={{ title, dueDate, priority, memo }}
        submitLabel="保存"
      />
      {/* ゴミ箱から元に戻せるので、ここでは確認を出さない */}
      <form action={moveTaskToTrashAction.bind(null, task.id)} className="border-t pt-4">
        <Button type="submit" variant="destructive" size="sm">
          削除（ゴミ箱に移す）
        </Button>
      </form>
    </div>
  );
}
