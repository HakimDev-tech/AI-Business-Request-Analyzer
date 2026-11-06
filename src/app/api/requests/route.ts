import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { getEnv } from "@/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get("limit") ?? 30);
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : 30;
    const workspaceId = getEnv().WORKSPACE_ID;
    const db = getDb();

    const [metricsResult, requestsResult, documentsResult, catalogResult] = await Promise.all([
      db.query(
        `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE decision = 'ready_for_quote')::int AS ready,
          COUNT(*) FILTER (WHERE decision = 'needs_clarification')::int AS clarification,
          COUNT(*) FILTER (WHERE decision = 'manual_review')::int AS review,
          COUNT(*) FILTER (WHERE decision = 'insufficient_stock')::int AS stock_issues,
          COUNT(*) FILTER (WHERE decision = 'no_catalog_match')::int AS no_match
        FROM analyzed_requests WHERE workspace_id = $1`,
        [workspaceId],
      ),
      db.query(
        `SELECT
          id, conversation_id, decision, created_at,
          extracted_data->>'summary' AS summary,
          extracted_data->>'product' AS product,
          extracted_data->>'quantity' AS quantity,
          extracted_data->>'destination' AS destination
        FROM analyzed_requests
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
        [workspaceId, limit],
      ),
      db.query(
        `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'indexed')::int AS indexed,
          COALESCE(SUM(chunk_count) FILTER (WHERE status = 'indexed'), 0)::int AS chunks
        FROM catalog_documents WHERE workspace_id = $1`,
        [workspaceId],
      ),
      db.query(
        `SELECT COUNT(*)::int AS products,
                COALESCE(SUM(i.available_quantity), 0)::float8 AS stock_units
         FROM catalog_items p
         LEFT JOIN inventory i ON i.catalog_item_id = p.id AND i.workspace_id = p.workspace_id
         WHERE p.workspace_id = $1 AND p.is_active = true`,
        [workspaceId],
      ),
    ]);

    return NextResponse.json({
      success: true,
      metrics: metricsResult.rows[0],
      documents: documentsResult.rows[0],
      catalog: catalogResult.rows[0],
      requests: requestsResult.rows,
    });
  } catch (error) {
    console.error("Request overview failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not load workspace data" },
      { status: 500 },
    );
  }
}
