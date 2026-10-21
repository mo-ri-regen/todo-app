import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

type SessionPayload = {
  sub: "owner";
};

const SECRET_MIN_LENGTH = 32;

// SESSION_SECRET が十分な長さで設定されているか
export function hasSessionSecret() {
  return (process.env.SESSION_SECRET?.length ?? 0) >= SECRET_MIN_LENGTH;
}

function getSecretKey() {
  if (!hasSessionSecret()) {
    throw new Error(`SESSION_SECRET must be set to at least ${SECRET_MIN_LENGTH} characters.`);
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecretKey());
}

export async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload.sub === "owner" ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession() {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ sub: "owner" });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
