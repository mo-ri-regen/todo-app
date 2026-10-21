import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchableTaskList } from "@/components/tasks/searchable-task-list";
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
    <SearchableTaskList
      path="/completed"
      query={query}
      tasks={tasks}
      emptyMessage="完了したタスクはありません"
    />
  );
}
