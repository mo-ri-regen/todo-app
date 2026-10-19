import { Suspense } from "react";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { verifySession } from "@/lib/dal";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">todo</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            ログアウト
          </Button>
        </form>
      </header>
      {/* ログイン状態の確認は Cookie を読むため、Suspense の中で行う */}
      <Suspense fallback={null}>
        <TaskArea />
      </Suspense>
    </div>
  );
}

async function TaskArea() {
  await verifySession();

  return (
    <main className="flex flex-1 items-center justify-center text-muted-foreground">
      タスクの画面はこれから作ります
    </main>
  );
}
