import { NextResponse } from "next/server";
import { isWorkspaceAuthConfigured, workspaceRequestAuthorized } from "@/lib/workspace-auth";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const configured = isWorkspaceAuthConfigured();
  return NextResponse.json({
    configured,
    authenticated: configured && workspaceRequestAuthorized(request),
  });
}
