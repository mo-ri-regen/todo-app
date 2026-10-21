"use server";

import * as z from "zod";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import {
  PRIORITIES,
  taskIdSchema,
  taskInputSchema,
  type Priority,
  type Task,
  type TaskInput,
} from "@/lib/tasks/schema";
import {
  createTask,
  deleteTaskPermanently,
  moveTaskToTrash,
  restoreTask,
  setTaskCompleted,
  updateTask,
} from "@/lib/tasks/store";

export type TaskFormState =
  | {
      errors?: Partial<Record<keyof TaskInput, string[]>>;
      message?: string;
      // 入力エラーのとき、フォームに戻す値
      values?: TaskInput;
    }
  | undefined;

// ログインを確認してから、タスク ID の形をチェックする（おかしな ID なら null）
async function authorizeTaskId(id: string) {
  await verifySession();
  const parsed = taskIdSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

// タスクが入っている一覧の URL（完了済みなら「完了済み」）
function listPathOf(task: Pick<Task, "completedAt"> | null) {
  return task?.completedAt ? "/completed" : "/";
}

function readTaskForm(formData: FormData) {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const raw = {
    title: text("title"),
    dueDate: text("dueDate"),
    priority: text("priority"),
    memo: text("memo"),
  };
  const parsed = taskInputSchema.safeParse(raw);
  const values: TaskInput = {
    ...raw,
    dueDate: raw.dueDate || null,
    priority: PRIORITIES.includes(raw.priority as Priority)
      ? (raw.priority as Priority)
      : "medium",
  };
  return { parsed, values };
}

export async function createTaskAction(
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await verifySession();

  const { parsed, values } = readTaskForm(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  await createTask(parsed.data);
  refresh();
  return undefined;
}

export async function updateTaskAction(
  id: string,
  _state: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const taskId = await authorizeTaskId(id);
  if (!taskId) {
    return { message: "タスクが見つかりません。" };
  }

  const { parsed, values } = readTaskForm(formData);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const updated = await updateTask(taskId, parsed.data);
  if (!updated) {
    return { message: "タスクが見つかりません。" };
  }
  redirect(listPathOf(updated));
}

export async function setTaskCompletedAction(id: string, completed: boolean) {
  const taskId = await authorizeTaskId(id);
  if (!taskId || typeof completed !== "boolean") return;

  await setTaskCompleted(taskId, completed);
  refresh();
}

export async function moveTaskToTrashAction(id: string) {
  const taskId = await authorizeTaskId(id);
  const moved = taskId ? await moveTaskToTrash(taskId) : null;
  redirect(listPathOf(moved));
}

export async function restoreTaskAction(id: string) {
  const taskId = await authorizeTaskId(id);
  if (!taskId) return;

  await restoreTask(taskId);
  refresh();
}

export async function deleteTaskPermanentlyAction(id: string) {
  const taskId = await authorizeTaskId(id);
  if (!taskId) return;

  await deleteTaskPermanently(taskId);
  refresh();
}
