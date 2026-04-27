import { auth } from "@clerk/nextjs/server";
import { SessionRepository } from "@/lib/repositories/sessions";
import { LocationRepository } from "@/lib/repositories/locations";
import { StakesRepository } from "@/lib/repositories/stakes";
import { SettingsRepository } from "@/lib/repositories/settings";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const [sessions, locations, stakes, settings] = await Promise.all([
    SessionRepository.getAll(userId),
    LocationRepository.getAll(userId),
    StakesRepository.getAll(userId),
    SettingsRepository.get(userId),
  ]);
  const payload = {
    version: "1",
    exported_at: new Date().toISOString(),
    sessions,
    locations,
    stakes,
    settings,
  };
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
