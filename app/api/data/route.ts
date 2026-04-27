import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sessions, locations, stakes, settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
