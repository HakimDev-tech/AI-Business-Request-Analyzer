import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { getEnv } from "@/config/env";
import { workspaceRequestAuthorized } from "@/lib/workspace-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).default(""),
  unit: z.string().trim().min(1).max(30).default("unit"),
  price_amount: z.number().nonnegative().nullable().default(null),
  price_currency: z.string().trim().length(3).toUpperCase().nullable().default(null),
  available_quantity: z.number().nonnegative().default(0),
});

export async function GET(request: Request) {
  if (!workspaceRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  try {
    const result = await getDb().query(
      `SELECT p.id, p.sku, p.name, p.description, p.unit,
              p.price_amount::float8 AS price_amount, p.price_currency,
              COALESCE(i.available_quantity, 0)::float8 AS available_quantity,
              i.updated_at AS stock_updated_at
       FROM catalog_items p
       LEFT JOIN inventory i
         ON i.catalog_item_id = p.id AND i.workspace_id = p.workspace_id
       WHERE p.workspace_id = $1 AND p.is_active = true
       ORDER BY p.name ASC`,
      [getEnv().WORKSPACE_ID],
    );
    return NextResponse.json({ success: true, products: result.rows });
  } catch (error) {
    console.error("Product catalog read failed:", error);
    return NextResponse.json({ success: false, error: "Could not load product catalog" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!workspaceRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid product details", details: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const db = getDb();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const created = await client.query(
      `INSERT INTO catalog_items
        (workspace_id, sku, name, description, unit, price_amount, price_currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id`,
      [getEnv().WORKSPACE_ID, data.sku, data.name, data.description, data.unit, data.price_amount, data.price_currency],
    );
    const productId = created.rows[0].id as string;
    await client.query(
      `INSERT INTO inventory (workspace_id, catalog_item_id, available_quantity)
       VALUES ($1,$2,$3)`,
      [getEnv().WORKSPACE_ID, productId, data.available_quantity],
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true, productId }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ success: false, error: "A product with this SKU already exists" }, { status: 409 });
    }
    console.error("Product creation failed:", error);
    return NextResponse.json({ success: false, error: "Could not create product" }, { status: 500 });
  } finally {
    client.release();
  }
}
