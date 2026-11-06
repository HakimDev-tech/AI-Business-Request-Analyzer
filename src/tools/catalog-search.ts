import { getDb } from "@/db/client";
import { getEnv } from "@/config/env";

export async function searchCatalog(query: string, limit = 5) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2).slice(0, 6);
  const patterns = terms.map((term) => `%${term}%`);
  const result = await getDb().query(
    `SELECT id, sku, name, description, unit, price_amount, price_currency
     FROM catalog_items
     WHERE workspace_id = $1 AND is_active = true
       AND (name ILIKE $2 OR sku ILIKE $2 OR description ILIKE $2
            OR lower(concat_ws(' ', name, sku, description)) LIKE ANY($3::text[]))
     ORDER BY CASE WHEN lower(name) = lower($4) THEN 0 ELSE 1 END, name
     LIMIT $5`,
    [getEnv().WORKSPACE_ID, `%${query}%`, patterns, query, Math.min(Math.max(limit, 1), 10)],
  );
  return result.rows;
}