import "server-only";

import { randomUUID } from "node:crypto";

import { PRIORITIES, type Task, type TaskInput } from "@/lib/tasks/schema";

// DB をつなぐまでの仮の保存場所（メモリ）。サーバーを再起動すると消える。
// DB に差し替えるときは、このファイルの関数の中身だけを置き換える。
const globalForTasks = globalThis as unknown as { tasks?: Map<string, Task> };
const tasks = (globalForTasks.tasks ??= new Map<string, Task>());

const priorityRank = (task: Task) => PRIORITIES.indexOf(task.priority);

// 優先度（高→低）→ 期限（近い順・期限なしは最後）→ 作った順
function compareActive(a: Task, b: Task) {
  if (priorityRank(a) !== priorityRank(b)) return priorityRank(a) - priorityRank(b);
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  return a.createdAt.getTime() - b.createdAt.getTime();
}

export async function listActiveTasks() {
  return [...tasks.values()].filter((t) => t.completedAt === null).sort(compareActive);
}

// 完了した日時の新しい順
export async function listCompletedTasks() {
  return [...tasks.values()]
    .filter((t) => t.completedAt !== null)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
}

export async function getTask(id: string) {
  return tasks.get(id) ?? null;
}

export async function createTask(input: TaskInput) {
  const now = new Date();
  const task: Task = {
    ...input,
    id: randomUUID(),
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  tasks.set(task.id, task);
  return task;
}

export async function updateTask(id: string, input: TaskInput) {
  const task = tasks.get(id);
  if (!task) return null;
  const updated: Task = { ...task, ...input, updatedAt: new Date() };
  tasks.set(id, updated);
  return updated;
}

export async function setTaskCompleted(id: string, completed: boolean) {
  const task = tasks.get(id);
  if (!task) return null;
  const now = new Date();
  const updated: Task = {
    ...task,
    completedAt: completed ? now : null,
    updatedAt: now,
  };
  tasks.set(id, updated);
  return updated;
}
