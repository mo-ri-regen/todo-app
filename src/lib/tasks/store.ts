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

// 全角・半角や大文字・小文字の違いを無視して比べる
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();

function matches(task: Task, query: string) {
  if (!query) return true;
  const q = normalize(query);
  return normalize(task.title).includes(q) || normalize(task.memo).includes(q);
}

const notTrashed = () => [...tasks.values()].filter((t) => t.deletedAt === null);

export async function listActiveTasks(query = "") {
  return notTrashed()
    .filter((t) => t.completedAt === null && matches(t, query))
    .sort(compareActive);
}

// 完了した日時の新しい順
export async function listCompletedTasks(query = "") {
  return notTrashed()
    .filter((t) => t.completedAt !== null && matches(t, query))
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
}

// ゴミ箱に入れた日時の新しい順
export async function listTrashedTasks() {
  return [...tasks.values()]
    .filter((t) => t.deletedAt !== null)
    .sort((a, b) => b.deletedAt!.getTime() - a.deletedAt!.getTime());
}

// ゴミ箱に入っているタスクは返さない
export async function getTask(id: string) {
  const task = tasks.get(id);
  return task && task.deletedAt === null ? task : null;
}

export async function createTask(input: TaskInput) {
  const now = new Date();
  const task: Task = {
    ...input,
    id: randomUUID(),
    completedAt: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  tasks.set(task.id, task);
  return task;
}

// ゴミ箱に入っているタスクだけを返す
function getTrashedTask(id: string) {
  const task = tasks.get(id);
  return task && task.deletedAt !== null ? task : null;
}

// タスクの一部を書き換えて保存する（updatedAt も更新する）
function saveChanges(task: Task, changes: (now: Date) => Partial<Task>) {
  const now = new Date();
  const updated: Task = { ...task, ...changes(now), updatedAt: now };
  tasks.set(task.id, updated);
  return updated;
}

export async function updateTask(id: string, input: TaskInput) {
  const task = await getTask(id);
  return task && saveChanges(task, () => input);
}

export async function setTaskCompleted(id: string, completed: boolean) {
  const task = await getTask(id);
  return task && saveChanges(task, (now) => ({ completedAt: completed ? now : null }));
}

export async function moveTaskToTrash(id: string) {
  const task = await getTask(id);
  return task && saveChanges(task, (now) => ({ deletedAt: now }));
}

// 完了の状態はそのまま残すので、元の場所（やること／完了済み）に戻る
export async function restoreTask(id: string) {
  const task = getTrashedTask(id);
  return task && saveChanges(task, () => ({ deletedAt: null }));
}

// 完全に削除できるのは、ゴミ箱に入っているタスクだけ
export async function deleteTaskPermanently(id: string) {
  return getTrashedTask(id) ? tasks.delete(id) : false;
}
