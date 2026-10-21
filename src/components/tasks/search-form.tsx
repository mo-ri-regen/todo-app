import Form from "next/form";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEARCH_MAX } from "@/lib/tasks/schema";

// 送信すると ?q=キーワード の URL に移動する（ブラウザの「戻る」で元の結果に戻れる）
export function SearchForm({ action, query }: { action: string; query: string }) {
  return (
    <Form action={action} role="search" className="flex gap-2">
      <Input
        name="q"
        type="search"
        defaultValue={query}
        maxLength={SEARCH_MAX}
        placeholder="タイトル・メモで検索"
        aria-label="検索キーワード"
      />
      <Button type="submit" variant="secondary">
        検索
      </Button>
      {query && (
        <Link href={action} className={buttonVariants({ variant: "ghost" })}>
          クリア
        </Link>
      )}
    </Form>
  );
}
