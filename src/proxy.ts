import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Cookie だけを見る簡易チェック。正式な確認は各ページ・Server Action の verifySession で行う
export default async function proxy(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/login";
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
