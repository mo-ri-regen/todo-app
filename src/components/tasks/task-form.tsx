"use client";

import { useActionState } from "react";

import type { TaskFormState } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MEMO_MAX,
  PRIORITIES,
  PRIORITY_LABELS,
  TITLE_MAX,
  type TaskInput,
} from "@/lib/tasks/schema";

type Props = {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  defaultValues?: TaskInput;
  submitLabel: string;
};

const EMPTY: TaskInput = { title: "", dueDate: null, priority: "medium", memo: "" };

export function TaskForm({ action, defaultValues = EMPTY, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // 入力エラーのときは、送信した値を残す（送信後にフォームが初期値へ戻るため）
  const values = state?.values ?? defaultValues;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field id="title" label="タイトル" errors={state?.errors?.title}>
        <Input
          id="title"
          name="title"
          required
          maxLength={TITLE_MAX}
          defaultValue={values.title}
          aria-invalid={state?.errors?.title ? true : undefined}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="dueDate" label="期限" errors={state?.errors?.dueDate}>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={values.dueDate ?? ""}
            aria-invalid={state?.errors?.dueDate ? true : undefined}
          />
        </Field>
        <Field id="priority" label="優先度" errors={state?.errors?.priority}>
          <select
            id="priority"
            name="priority"
            defaultValue={values.priority}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-base md:text-sm dark:bg-input/30"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="memo" label="メモ" errors={state?.errors?.memo}>
        <Textarea
          id="memo"
          name="memo"
          rows={3}
          maxLength={MEMO_MAX}
          defaultValue={values.memo}
          aria-invalid={state?.errors?.memo ? true : undefined}
        />
      </Field>

      {state?.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-end">
        {pending ? "保存中…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  errors,
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {errors?.map((error) => (
        <p key={error} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ))}
    </div>
  );
}
