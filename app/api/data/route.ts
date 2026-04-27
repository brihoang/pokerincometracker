import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sessions, locations, stakes, settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const [s, l, st, se] = await Promise.all([
    db.select({ id: sessions.id }).from(sessions).where(eq(sessions.user_id, userId)).limit(1),
    db.select({ id: locations.id }).from(locations).where(eq(locations.user_id, userId)).limit(1),
    db.select({ id: stakes.id }).from(stakes).where(eq(stakes.user_id, userId)).limit(1),
    db.select({ user_id: settings.user_id }).from(settings).where(eq(settings.user_id, userId)).limit(1),
  ]);

  return Response.json({ hasData: s.length > 0 || l.length > 0 || st.length > 0 || se.length > 0 });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await Promise.all([
    db.delete(sessions).where(eq(sessions.user_id, userId)),
    db.delete(locations).where(eq(locations.user_id, userId)),
    db.delete(stakes).where(eq(stakes.user_id, userId)),
    db.delete(settings).where(eq(settings.user_id, userId)),
  ]);

  return new Response(null, { status: 204 });
}
