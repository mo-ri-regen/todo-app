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
  await verifySession();

  const parsedId = taskIdSchema.safeParse(id);
  const { parsed, values } = readTaskForm(formData);
  if (!parsedId.success) {
    return { message: "タスクが見つかりません。" };
  }
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const updated = await updateTask(parsedId.data, parsed.data);
  if (!updated) {
    return { message: "タスクが見つかりません。" };
  }
  redirect(updated.completedAt ? "/completed" : "/");
}

export async function setTaskCompletedAction(id: string, completed: boolean) {
  await verifySession();

  const parsedId = taskIdSchema.safeParse(id);
  if (!parsedId.success || typeof completed !== "boolean") return;

  await setTaskCompleted(parsedId.data, completed);
  refresh();
}

export async function moveTaskToTrashAction(id: string) {
  await verifySession();

  const parsedId = taskIdSchema.safeParse(id);
  const moved = parsedId.success ? await moveTaskToTrash(parsedId.data) : null;
  redirect(moved?.completedAt ? "/completed" : "/");
}

export async function restoreTaskAction(id: string) {
  await verifySession();

  const parsedId = taskIdSchema.safeParse(id);
  if (!parsedId.success) return;

  await restoreTask(parsedId.data);
  refresh();
}

export async function deleteTaskPermanentlyAction(id: string) {
  await verifySession();

  const parsedId = taskIdSchema.safeParse(id);
  if (!parsedId.success) return;

  await deleteTaskPermanently(parsedId.data);
  refresh();
}
