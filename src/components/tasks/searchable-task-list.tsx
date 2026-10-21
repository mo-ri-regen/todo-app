import { SearchForm } from "@/components/tasks/search-form";
import { TaskList } from "@/components/tasks/task-list";
import type { Task } from "@/lib/tasks/schema";

type Props = {
  // 検索したときに移動する一覧の URL
  path: string;
  query: string;
  tasks: Task[];
  // 検索していないときに、タスクが1件もない場合の表示
  emptyMessage: string;
};

export function SearchableTaskList({ path, query, tasks, emptyMessage }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <SearchForm action={path} query={query} />
      <TaskList tasks={tasks} emptyMessage={query ? "見つかりませんでした" : emptyMessage} />
    </section>
  );
}
