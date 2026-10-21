"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";

import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

// 長さが違っても比較時間が変わらないよう、ハッシュにそろえてから比べる
function isSamePassword(input: string, expected: string) {
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret || secret.length < 32) {
    return { error: "サーバーのログイン設定が足りません。" };
  }

  const input = formData.get("password");
  if (typeof input !== "string" || !isSamePassword(input, expected)) {
    return { error: "パスワードが違います。" };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
