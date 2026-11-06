import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const WORKSPACE_SESSION_COOKIE = "veyra_session";
export const WORKSPACE_SESSION_TTL_SECONDS = 60 * 60 * 12;

export function isWorkspaceAuthConfigured() {
  return Boolean(
    process.env.WORKSPACE_ACCESS_PASSWORD &&
    (process.env.WORKSPACE_SESSION_SECRET?.length ?? 0) >= 32,
  );
}

function sessionSecret() {
  const secret = process.env.WORKSPACE_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("WORKSPACE_SESSION_SECRET must contain at least 32 characters");
  }
  return secret;
}

export function matchesWorkspacePassword(candidate: string) {
  const expected = process.env.WORKSPACE_ACCESS_PASSWORD;
  if (!expected) return false;
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash);
}

export function createWorkspaceSession() {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + WORKSPACE_SESSION_TTL_SECONDS * 1000 }),
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return payload + "." + signature;
}

export function verifyWorkspaceSession(token: string | undefined) {
  if (!token || !isWorkspaceAuthConfigured()) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;

  const expected = createHmac("sha256", sessionSecret()).update(payload).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { expiresAt?: number };
    return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function workspaceRequestAuthorized(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const cookie = header.split(";").map(part => part.trim()).find(part => part.startsWith(WORKSPACE_SESSION_COOKIE + "="));
  const token = cookie?.slice(WORKSPACE_SESSION_COOKIE.length + 1);
  return verifyWorkspaceSession(token ? decodeURIComponent(token) : undefined);
}
