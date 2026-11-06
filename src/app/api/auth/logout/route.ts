import { NextResponse } from "next/server";
import { WORKSPACE_SESSION_COOKIE } from "@/lib/workspace-auth";

export const runtime = "nodejs";
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: WORKSPACE_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
