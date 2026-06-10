import { cookies } from "next/headers";

const COOKIE_NAME = "othersstudio_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Buffer.from(sig).toString("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function signToken(secret: string): Promise<string> {
  const ts = Date.now();
  const sig = await hmacSign(String(ts), secret);
  return `${ts}.${sig}`;
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const ts = parseInt(token.slice(0, dot), 10);
  const sig = token.slice(dot + 1);
  if (isNaN(ts) || Date.now() - ts > COOKIE_MAX_AGE * 1000) return false;
  const expected = await hmacSign(String(ts), secret);
  return timingSafeEqual(sig, expected);
}

export async function isAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token, secret);
}

export async function setAuthCookie(): Promise<void> {
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const token = await signToken(secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/admin",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  const padded = password.padEnd(expected.length, "\0");
  const paddedExpected = expected.padEnd(password.length, "\0");
  return timingSafeEqual(padded, paddedExpected);
}

export { COOKIE_NAME };
