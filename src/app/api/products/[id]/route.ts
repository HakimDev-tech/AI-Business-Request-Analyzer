import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { getEnv } from "@/config/env";
import { workspaceRequestAuthorized } from "@/lib/workspace-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  available_quantity: z.number().nonnegative(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!workspaceRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ success: false, error: "Invalid product identifier" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Stock quantity must be a non-negative number" }, { status: 400 });
  }

  const db = getDb();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const product = await client.query(
      "SELECT id FROM catalog_items WHERE id=$1 AND workspace_id=$2 AND is_active=true FOR UPDATE",
      [id, getEnv().WORKSPACE_ID],
    );
    if (!product.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    await client.query(
      `INSERT INTO inventory (workspace_id, catalog_item_id, available_quantity, updated_at)
       VALUES ($1,$2,$3,now())
       ON CONFLICT (workspace_id,catalog_item_id)
       DO UPDATE SET available_quantity=EXCLUDED.available_quantity, updated_at=now()`,
      [getEnv().WORKSPACE_ID, id, parsed.data.available_quantity],
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true, productId: id, available_quantity: parsed.data.available_quantity });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Stock update failed:", error);
    return NextResponse.json({ success: false, error: "Could not update inventory" }, { status: 500 });
  } finally {
    client.release();
  }
}
