import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createWorkspaceSession,
  isWorkspaceAuthConfigured,
  matchesWorkspacePassword,
  WORKSPACE_SESSION_COOKIE,
  WORKSPACE_SESSION_TTL_SECONDS,
} from "@/lib/workspace-auth";

export const runtime = "nodejs";
const schema = z.object({ password: z.string().min(1).max(512) });

export async function POST(request: Request) {
  if (!isWorkspaceAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: "Workspace access is not configured on this deployment" },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter the workspace password" }, { status: 400 });
  }
  if (!matchesWorkspacePassword(parsed.data.password)) {
    return NextResponse.json({ success: false, error: "Incorrect workspace password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: WORKSPACE_SESSION_COOKIE,
    value: createWorkspaceSession(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WORKSPACE_SESSION_TTL_SECONDS,
  });
  return response;
}
