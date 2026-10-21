import Link from "next/link";

import { EmptyState } from "@/components/empty-state";

// タスクが存在しない・ゴミ箱に入っている・URL の ID がおかしいときに表示する
export default function TaskNotFound() {
  return (
    <main className="flex flex-col gap-4">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← 一覧に戻る
      </Link>
      <EmptyState>
        タスクが見つかりません。
        <br />
        削除されたか、ゴミ箱に入っている可能性があります。
      </EmptyState>
    </main>
  );
}
