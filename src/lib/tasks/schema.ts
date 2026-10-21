import * as z from "zod";

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const TITLE_MAX = 200;
export const MEMO_MAX = 2000;

function isValidDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "タイトルを入力してください。" })
    .max(TITLE_MAX, { error: `タイトルは${TITLE_MAX}文字以内にしてください。` }),
  dueDate: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && isValidDate(v)), {
      error: "期限の日付が正しくありません。",
    })
    .transform((v) => (v === "" ? null : v)),
  priority: z.enum(PRIORITIES, { error: "優先度を選んでください。" }),
  memo: z
    .string()
    .trim()
    .max(MEMO_MAX, { error: `メモは${MEMO_MAX}文字以内にしてください。` }),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

export const taskIdSchema = z.uuid();

export const SEARCH_MAX = 100;

// 検索キーワード。おかしな値（配列・長すぎる文字列）は「検索なし」として扱う
export const searchQuerySchema = z
  .string()
  .trim()
  .max(SEARCH_MAX)
  .catch("");

export type Task = TaskInput & {
  id: string;
  completedAt: Date | null;
  // ゴミ箱に入れた日時（入っていなければ null）
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
