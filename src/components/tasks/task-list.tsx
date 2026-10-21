import Link from "next/link";

import { CompleteCheckbox } from "@/components/tasks/complete-checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDueDate } from "@/lib/tasks/format";
import { PRIORITY_LABELS, type Task } from "@/lib/tasks/schema";

const PRIORITY_VARIANTS = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

export function TaskList({ tasks, emptyMessage }: { tasks: Task[]; emptyMessage: string }) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 px-3 py-3">
          <CompleteCheckbox
            id={task.id}
            title={task.title}
            completed={task.completedAt !== null}
          />
          <Link href={`/tasks/${task.id}`} className="flex min-w-0 flex-1 flex-col gap-1">
            <span
              className={
                task.completedAt
                  ? "break-words text-muted-foreground line-through"
                  : "break-words"
              }
            >
              {task.title}
            </span>
            <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={PRIORITY_VARIANTS[task.priority]}>
                優先度：{PRIORITY_LABELS[task.priority]}
              </Badge>
              {task.dueDate && <span>期限：{formatDueDate(task.dueDate)}</span>}
              {task.memo && <span>メモあり</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
