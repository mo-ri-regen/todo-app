import { logout } from "@/app/actions/auth";
import { NavTabs } from "@/components/nav-tabs";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">todo</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            ログアウト
          </Button>
        </form>
      </header>
      <NavTabs />
      {children}
    </div>
  );
}
