import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/schema";
import { Session } from "@/lib/types";
import { generateId } from "@/lib/utils/uuid";

type CreateSessionData = Omit<
  Session,
  "id" | "ended_at" | "duration_mins" | "cash_out" | "profit_loss" | "notes" | "rating" | "status" | "created_at" | "updated_at"
> & { big_blind?: number | null };

// DB row → Session (cents → dollars, Date → ISO string)
function rowToSession(row: typeof sessions.$inferSelect): Session {
  return {
    id: row.id,
    started_at: row.started_at.toISOString(),
    ended_at: row.ended_at ? row.ended_at.toISOString() : null,
    duration_mins: row.duration_mins ?? null,
    location_id: row.location_id,
    location_name: row.location_name,
    stakes_id: row.stakes_id,
    stakes_label: row.stakes_label,
    big_blind: row.big_blind != null ? row.big_blind / 100 : null,
    game_type: "NLH",
    buy_in: row.buy_in / 100,
    cash_out: row.cash_out != null ? row.cash_out / 100 : null,
    profit_loss: row.profit_loss != null ? row.profit_loss / 100 : null,
    notes: row.notes ?? null,
    rating: (row.rating as Session["rating"]) ?? null,
    status: row.status as "open" | "closed",
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

async function getAll(userId: string): Promise<Session[]> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.user_id, userId))
    .orderBy(desc(sessions.started_at));
  return rows.map(rowToSession);
}

async function getById(userId: string, id: string): Promise<Session | null> {
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.user_id, userId), eq(sessions.id, id)));
  return rows.length > 0 ? rowToSession(rows[0]) : null;
}

async function getOpen(userId: string): Promise<Session | null> {
  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.user_id, userId), eq(sessions.status, "open")));
  return rows.length > 0 ? rowToSession(rows[0]) : null;
}

async function create(userId: string, data: CreateSessionData): Promise<Session> {
  const now = new Date();
  const id = generateId();

  const rows = await db
    .insert(sessions)
    .values({
      id,
      user_id: userId,
      started_at: new Date(data.started_at),
      ended_at: null,
      duration_mins: null,
      location_id: data.location_id,
      location_name: data.location_name,
      stakes_id: data.stakes_id,
      stakes_label: data.stakes_label,
      big_blind: data.big_blind != null ? Math.round(data.big_blind * 100) : null,
      game_type: "NLH",
      buy_in: Math.round(data.buy_in * 100),
      cash_out: null,
      profit_loss: null,
      notes: null,
      rating: null,
      status: "open",
      created_at: now,
      updated_at: now,
    })
    .returning();

  return rowToSession(rows[0]);
}

async function update(
  userId: string,
  id: string,
  data: Partial<Omit<Session, "id" | "created_at">>
): Promise<Session | null> {
  const now = new Date();

  const patch: Partial<typeof sessions.$inferInsert> = { updated_at: now };

  if (data.started_at !== undefined) patch.started_at = new Date(data.started_at);
  if (data.ended_at !== undefined) patch.ended_at = data.ended_at ? new Date(data.ended_at) : null;
  if (data.duration_mins !== undefined) patch.duration_mins = data.duration_mins;
  if (data.location_id !== undefined) patch.location_id = data.location_id;
  if (data.location_name !== undefined) patch.location_name = data.location_name;
  if (data.stakes_id !== undefined) patch.stakes_id = data.stakes_id;
  if (data.stakes_label !== undefined) patch.stakes_label = data.stakes_label;
  if (data.big_blind !== undefined) patch.big_blind = data.big_blind != null ? Math.round(data.big_blind * 100) : null;
  if (data.game_type !== undefined) patch.game_type = data.game_type;
  if (data.buy_in !== undefined) patch.buy_in = Math.round(data.buy_in * 100);
  if (data.cash_out !== undefined) patch.cash_out = data.cash_out != null ? Math.round(data.cash_out * 100) : null;
  if (data.profit_loss !== undefined) patch.profit_loss = data.profit_loss != null ? Math.round(data.profit_loss * 100) : null;
  if (data.notes !== undefined) patch.notes = data.notes;
  if (data.rating !== undefined) patch.rating = data.rating;
  if (data.status !== undefined) patch.status = data.status;

  const rows = await db
    .update(sessions)
    .set(patch)
    .where(and(eq(sessions.user_id, userId), eq(sessions.id, id)))
    .returning();

  return rows.length > 0 ? rowToSession(rows[0]) : null;
}

async function remove(userId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(sessions)
    .where(and(eq(sessions.user_id, userId), eq(sessions.id, id)))
    .returning({ id: sessions.id });
  return rows.length > 0;
}

export const SessionRepository = { getAll, getById, getOpen, create, update, delete: remove };
