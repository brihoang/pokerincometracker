import { auth } from "@clerk/nextjs/server";
import { SessionRepository } from "@/lib/repositories/sessions";
import { LocationRepository } from "@/lib/repositories/locations";
import { StakesRepository } from "@/lib/repositories/stakes";
import { SettingsRepository } from "@/lib/repositories/settings";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const payload = {
    version: "1",
    exported_at: new Date().toISOString(),
    sessions: SessionRepository.getAll(),
    locations: LocationRepository.getAll(),
    stakes: StakesRepository.getAll(),
    settings: SettingsRepository.get(),
  };
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
}
