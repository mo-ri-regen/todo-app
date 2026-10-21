"use client";

import { useOptimistic, useTransition } from "react";

import { setTaskCompletedAction } from "@/app/actions/tasks";
import { Checkbox } from "@/components/ui/checkbox";

type Props = { id: string; title: string; completed: boolean };

export function CompleteCheckbox({ id, title, completed }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(completed);
  const [pending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={optimistic}
      disabled={pending}
      aria-label={`「${title}」を${optimistic ? "未完了に戻す" : "完了にする"}`}
      className="mt-1"
      onCheckedChange={(checked) =>
        startTransition(async () => {
          setOptimistic(checked);
          await setTaskCompletedAction(id, checked);
        })
      }
    />
  );
}
