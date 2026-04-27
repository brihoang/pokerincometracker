import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { stakes } from "@/lib/schema";
import { generateId } from "@/lib/utils/uuid";
import type { Stakes } from "@/lib/types";

type CreateInput = Omit<Stakes, "id" | "created_at" | "updated_at">;
type UpdateInput = Partial<Omit<Stakes, "id" | "created_at" | "updated_at">>;

function rowToStakes(row: typeof stakes.$inferSelect): Stakes {
  return {
    id: row.id,
    label: row.label,
    small_blind: row.small_blind != null ? row.small_blind / 100 : null,
    big_blind: row.big_blind != null ? row.big_blind / 100 : null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export const StakesRepository = {
  async getAll(userId: string): Promise<Stakes[]> {
    const rows = await db
      .select()
      .from(stakes)
      .where(eq(stakes.user_id, userId));
    return rows.map(rowToStakes).sort((a, b) => {
      if (a.small_blind === null && b.small_blind === null) {
        return a.label.localeCompare(b.label);
      }
      if (a.small_blind === null) return 1;
      if (b.small_blind === null) return -1;
      if (a.small_blind !== b.small_blind) return a.small_blind - b.small_blind;
      return a.label.localeCompare(b.label);
    });
  },

  async getById(userId: string, id: string): Promise<Stakes | null> {
    const rows = await db
      .select()
      .from(stakes)
      .where(and(eq(stakes.user_id, userId), eq(stakes.id, id)));
    return rows.length > 0 ? rowToStakes(rows[0]) : null;
  },

  async create(userId: string, data: CreateInput): Promise<Stakes> {
    if (!data.label.trim()) throw new Error("label is required");
    const now = new Date();
    const id = generateId();
    const rows = await db
      .insert(stakes)
      .values({
        id,
        user_id: userId,
        label: data.label.trim(),
        small_blind: data.small_blind != null ? Math.round(data.small_blind * 100) : null,
        big_blind: data.big_blind != null ? Math.round(data.big_blind * 100) : null,
        created_at: now,
        updated_at: now,
      })
      .returning();
    return rowToStakes(rows[0]);
  },

  async update(userId: string, id: string, data: UpdateInput): Promise<Stakes | null> {
    const setValues: Partial<typeof stakes.$inferInsert> = { updated_at: new Date() };
    if (data.label !== undefined) setValues.label = data.label.trim();
    if (data.small_blind !== undefined) {
      setValues.small_blind = data.small_blind != null ? Math.round(data.small_blind * 100) : null;
    }
    if (data.big_blind !== undefined) {
      setValues.big_blind = data.big_blind != null ? Math.round(data.big_blind * 100) : null;
    }
    const rows = await db
      .update(stakes)
      .set(setValues)
      .where(and(eq(stakes.user_id, userId), eq(stakes.id, id)))
      .returning();
    return rows.length > 0 ? rowToStakes(rows[0]) : null;
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const rows = await db
      .delete(stakes)
      .where(and(eq(stakes.user_id, userId), eq(stakes.id, id)))
      .returning();
    return rows.length > 0;
  },
};
