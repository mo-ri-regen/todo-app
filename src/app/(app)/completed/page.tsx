import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchForm } from "@/components/tasks/search-form";
import { TaskList } from "@/components/tasks/task-list";
import { verifySession } from "@/lib/dal";
import { searchQuerySchema } from "@/lib/tasks/schema";
import { listCompletedTasks } from "@/lib/tasks/store";

export const metadata: Metadata = {
  title: "完了済み | todo",
};

export default function CompletedPage({ searchParams }: PageProps<"/completed">) {
  return (
    <main>
      <Suspense fallback={null}>
        {searchParams.then(({ q }) => (
          <CompletedTasks query={searchQuerySchema.parse(q)} />
        ))}
      </Suspense>
    </main>
  );
}

async function CompletedTasks({ query }: { query: string }) {
  await verifySession();
  const tasks = await listCompletedTasks(query);
  return (
    <section className="flex flex-col gap-3">
      <SearchForm action="/completed" query={query} />
      <TaskList
        tasks={tasks}
        emptyMessage={query ? "見つかりませんでした" : "完了したタスクはありません"}
      />
    </section>
  );
}
