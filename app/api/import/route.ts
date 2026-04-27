import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sessions, locations, stakes, settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  if (body.version && body.version !== "1") {
    return Response.json({ error: `Unsupported version: ${body.version}` }, { status: 400 });
  }
  if (!Array.isArray(body.sessions)) {
    return Response.json({ error: "Missing or invalid 'sessions' array" }, { status: 400 });
  }
  if (!Array.isArray(body.locations)) {
    return Response.json({ error: "Missing or invalid 'locations' array" }, { status: 400 });
  }
  if (!Array.isArray(body.stakes)) {
    return Response.json({ error: "Missing or invalid 'stakes' array" }, { status: 400 });
  }

  for (let i = 0; i < body.sessions.length; i++) {
    const s = body.sessions[i];
    if (!s.id || !s.started_at || s.buy_in == null || !s.status) {
      return Response.json(
        { error: `Session at index ${i} is missing required fields (id, started_at, buy_in, status)` },
        { status: 400 }
      );
    }
  }

  // Full replace: delete all existing data for this user, then bulk insert
  await Promise.all([
    db.delete(sessions).where(eq(sessions.user_id, userId)),
    db.delete(locations).where(eq(locations.user_id, userId)),
    db.delete(stakes).where(eq(stakes.user_id, userId)),
    db.delete(settings).where(eq(settings.user_id, userId)),
  ]);

  if (body.sessions.length > 0) {
    await db.insert(sessions).values(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body.sessions.map((s: any) => ({
        id: s.id,
        user_id: userId,
        started_at: new Date(s.started_at),
        ended_at: s.ended_at ? new Date(s.ended_at) : null,
        duration_mins: s.duration_mins ?? null,
        location_id: s.location_id,
        location_name: s.location_name,
        stakes_id: s.stakes_id,
        stakes_label: s.stakes_label,
        big_blind: s.big_blind != null ? Math.round(s.big_blind * 100) : null,
        game_type: s.game_type ?? "NLH",
        buy_in: Math.round(s.buy_in * 100),
        cash_out: s.cash_out != null ? Math.round(s.cash_out * 100) : null,
        profit_loss: s.profit_loss != null ? Math.round(s.profit_loss * 100) : null,
        notes: s.notes ?? null,
        rating: s.rating ?? null,
        status: s.status,
        created_at: new Date(s.created_at),
        updated_at: new Date(s.updated_at),
      }))
    );
  }

  if (body.locations.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(locations).values(body.locations.map((l: any) => ({
      id: l.id,
      user_id: userId,
      name: l.name,
      created_at: new Date(l.created_at),
      updated_at: new Date(l.updated_at),
    })));
  }

  if (body.stakes.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(stakes).values(body.stakes.map((s: any) => ({
      id: s.id,
      user_id: userId,
      label: s.label,
      small_blind: s.small_blind != null ? Math.round(s.small_blind * 100) : null,
      big_blind: s.big_blind != null ? Math.round(s.big_blind * 100) : null,
      created_at: new Date(s.created_at),
      updated_at: new Date(s.updated_at),
    })));
  }

  if (body.settings) {
    await db.insert(settings).values({
      user_id: userId,
      default_location_id: body.settings.default_location_id ?? null,
      default_stakes_id: body.settings.default_stakes_id ?? null,
    }).onConflictDoUpdate({
      target: settings.user_id,
      set: {
        default_location_id: body.settings.default_location_id ?? null,
        default_stakes_id: body.settings.default_stakes_id ?? null,
      },
    });
  }

  return Response.json({
    imported: {
      sessions: body.sessions.length,
      locations: body.locations.length,
      stakes: body.stakes.length,
    },
  });
}
