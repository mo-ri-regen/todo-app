import { date, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// drizzle-kit からも読み込むため、"@/" ではなく相対パスで書く
import { PRIORITIES } from "../tasks/schema";

// 優先度は宣言した順（high → medium → low）で並ぶ
export const priorityEnum = pgEnum("priority", PRIORITIES);

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const tasks = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  // "2026-10-22" の形の文字列で読み書きする
  dueDate: date("due_date"),
  priority: priorityEnum().notNull(),
  memo: text().notNull().default(""),
  completedAt: timestamptz("completed_at"),
  // ゴミ箱に入れた日時（入っていなければ null）
  deletedAt: timestamptz("deleted_at"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at").notNull().defaultNow(),
});
