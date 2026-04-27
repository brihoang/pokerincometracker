import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations } from "@/lib/schema";
import { generateId } from "@/lib/utils/uuid";
import type { Location } from "@/lib/types";

function rowToLocation(row: typeof locations.$inferSelect): Location {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

async function getAll(userId: string): Promise<Location[]> {
  const rows = await db
    .select()
    .from(locations)
    .where(eq(locations.user_id, userId));
  return rows.map(rowToLocation).sort((a, b) => a.name.localeCompare(b.name));
}

async function getById(userId: string, id: string): Promise<Location | null> {
  const rows = await db
    .select()
    .from(locations)
    .where(and(eq(locations.user_id, userId), eq(locations.id, id)));
  return rows.length > 0 ? rowToLocation(rows[0]) : null;
}

async function create(userId: string, data: { name: string }): Promise<Location> {
  if (!data.name.trim()) throw new Error("Location name is required");
  const now = new Date();
  const id = generateId();
  const rows = await db
    .insert(locations)
    .values({
      id,
      user_id: userId,
      name: data.name.trim(),
      created_at: now,
      updated_at: now,
    })
    .returning();
  return rowToLocation(rows[0]);
}

async function update(userId: string, id: string, data: { name: string }): Promise<Location | null> {
  const rows = await db
    .update(locations)
    .set({ name: data.name.trim(), updated_at: new Date() })
    .where(and(eq(locations.user_id, userId), eq(locations.id, id)))
    .returning();
  return rows.length > 0 ? rowToLocation(rows[0]) : null;
}

async function remove(userId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(locations)
    .where(and(eq(locations.user_id, userId), eq(locations.id, id)))
    .returning();
  return rows.length > 0;
}

export const LocationRepository = { getAll, getById, create, update, delete: remove };
