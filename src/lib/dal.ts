import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, decrypt } from "@/lib/session";

// ページや Server Action の中で、ログイン済みかを確かめる（proxy の確認だけに頼らない）
export const verifySession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);
  if (!session) {
    redirect("/login");
  }
  return session;
});
