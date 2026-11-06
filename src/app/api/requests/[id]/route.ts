import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { getEnv } from "@/config/env";
import { workspaceRequestAuthorized } from "@/lib/workspace-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!workspaceRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const { id } = await context.params;
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request identifier" }, { status: 400 });
  }

  try {
    const result = await getDb().query(
      `SELECT id, conversation_id, original_message, extracted_data,
              decision, decision_payload, created_at
       FROM analyzed_requests
       WHERE id = $1 AND workspace_id = $2
       LIMIT 1`,
      [id, getEnv().WORKSPACE_ID],
    );

    if (!result.rowCount) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: result.rows[0] });
  } catch (error) {
    console.error("Request detail failed:", error);
    return NextResponse.json({ success: false, error: "Could not load request" }, { status: 500 });
  }
}
