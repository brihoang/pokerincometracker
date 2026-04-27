import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import type { AppSettings } from "@/lib/types";

function rowToSettings(row: typeof settings.$inferSelect): AppSettings {
  return {
    currency_symbol: "$",
    default_location_id: row.default_location_id ?? null,
    default_stakes_id: row.default_stakes_id ?? null,
  };
}

async function get(userId: string): Promise<AppSettings> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.user_id, userId));

  if (rows.length > 0) {
    return rowToSettings(rows[0]);
  }

  // Upsert default row
  const inserted = await db
    .insert(settings)
    .values({ user_id: userId, default_location_id: null, default_stakes_id: null })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    return rowToSettings(inserted[0]);
  }

  // Row was inserted by a concurrent request; re-fetch
  const refetched = await db
    .select()
    .from(settings)
    .where(eq(settings.user_id, userId));
  return rowToSettings(refetched[0]);
}

async function update(
  userId: string,
  data: Partial<Omit<AppSettings, "currency_symbol">>
): Promise<AppSettings> {
  // Ensure the row exists first
  await get(userId);

  const rows = await db
    .update(settings)
    .set({
      default_location_id: data.default_location_id ?? null,
      default_stakes_id: data.default_stakes_id ?? null,
    })
    .where(eq(settings.user_id, userId))
    .returning();

  return rowToSettings(rows[0]);
}

export const SettingsRepository = { get, update };
