import type { Task } from "@/lib/tasks/schema";

// タスクが入っている一覧の URL（完了済みなら「完了済み」）
export function listPathOf(task: Pick<Task, "completedAt"> | null) {
  return task?.completedAt ? "/completed" : "/";
}
