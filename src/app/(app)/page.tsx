import { Suspense } from "react";

import { createTaskAction } from "@/app/actions/tasks";
import { SearchForm } from "@/components/tasks/search-form";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { verifySession } from "@/lib/dal";
import { searchQuerySchema } from "@/lib/tasks/schema";
import { listActiveTasks } from "@/lib/tasks/store";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="flex flex-col gap-6">
      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-sm font-medium">やることを追加</h2>
        <TaskForm action={createTaskAction} submitLabel="追加" />
      </section>
      {/* ログインの確認・URL の検索キーワード・データの読み込みは、Suspense の中で行う */}
      <Suspense fallback={null}>
        {searchParams.then(({ q }) => (
          <ActiveTasks query={searchQuerySchema.parse(q)} />
        ))}
      </Suspense>
    </main>
  );
}

async function ActiveTasks({ query }: { query: string }) {
  await verifySession();
  const tasks = await listActiveTasks(query);
  return (
    <section className="flex flex-col gap-3">
      <SearchForm action="/" query={query} />
      <TaskList
        tasks={tasks}
        emptyMessage={query ? "見つかりませんでした" : "やることはありません"}
      />
    </section>
  );
}
