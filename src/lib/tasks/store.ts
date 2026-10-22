import "server-only";

import { and, asc, desc, eq, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import type { Task, TaskInput } from "@/lib/tasks/schema";

// タスクの保存場所（Neon の PostgreSQL）。画面や Server Action からは、このファイルの関数だけを使う。

// 全角・半角や大文字・小文字の違いを無視して比べる（DB 側も同じ変換をしてから比べる）
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();

// LIKE で特別な意味を持つ文字（\ % _）を、ただの文字として扱う
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

function matches(query: string): SQL | undefined {
  if (!query) return undefined;
  // キーワードは SQL に埋め込まず、パラメーターとして渡す
  const pattern = `%${escapeLike(normalize(query))}%`;
  return or(
    sql`lower(normalize(${tasks.title}, NFKC)) like ${pattern}`,
    sql`lower(normalize(${tasks.memo}, NFKC)) like ${pattern}`,
  );
}

const notTrashed = isNull(tasks.deletedAt);

// 優先度（高→低）→ 期限（近い順・期限なしは最後）→ 作った順
export async function listActiveTasks(query = ""): Promise<Task[]> {
  return getDb()
    .select()
    .from(tasks)
    .where(and(notTrashed, isNull(tasks.completedAt), matches(query)))
    .orderBy(asc(tasks.priority), sql`${tasks.dueDate} asc nulls last`, asc(tasks.createdAt));
}

// 完了した日時の新しい順
export async function listCompletedTasks(query = ""): Promise<Task[]> {
  return getDb()
    .select()
    .from(tasks)
    .where(and(notTrashed, isNotNull(tasks.completedAt), matches(query)))
    .orderBy(desc(tasks.completedAt));
}

// ゴミ箱に入れた日時の新しい順
export async function listTrashedTasks(): Promise<Task[]> {
  return getDb()
    .select()
    .from(tasks)
    .where(isNotNull(tasks.deletedAt))
    .orderBy(desc(tasks.deletedAt));
}

// ゴミ箱に入っているタスクは返さない
export async function getTask(id: string): Promise<Task | null> {
  const [task] = await getDb()
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), notTrashed));
  return task ?? null;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const [task] = await getDb().insert(tasks).values(input).returning();
  return task;
}

// 条件に合うタスクの一部を書き換えて保存する（updatedAt も更新する）
async function saveChanges(
  id: string,
  condition: SQL | undefined,
  changes: Partial<typeof tasks.$inferInsert>,
): Promise<Task | null> {
  const [task] = await getDb()
    .update(tasks)
    .set({ ...changes, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), condition))
    .returning();
  return task ?? null;
}

export async function updateTask(id: string, input: TaskInput) {
  return saveChanges(id, notTrashed, input);
}

export async function setTaskCompleted(id: string, completed: boolean) {
  return saveChanges(id, notTrashed, { completedAt: completed ? new Date() : null });
}

export async function moveTaskToTrash(id: string) {
  return saveChanges(id, notTrashed, { deletedAt: new Date() });
}

// 完了の状態はそのまま残すので、元の場所（やること／完了済み）に戻る
export async function restoreTask(id: string) {
  return saveChanges(id, isNotNull(tasks.deletedAt), { deletedAt: null });
}

// 完全に削除できるのは、ゴミ箱に入っているタスクだけ
export async function deleteTaskPermanently(id: string) {
  const deleted = await getDb()
    .delete(tasks)
    .where(and(eq(tasks.id, id), isNotNull(tasks.deletedAt)))
    .returning({ id: tasks.id });
  return deleted.length > 0;
}
