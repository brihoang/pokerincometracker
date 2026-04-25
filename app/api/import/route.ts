import { NextRequest } from "next/server";
import { SessionRepository } from "@/lib/repositories/sessions";
import { LocationRepository } from "@/lib/repositories/locations";
import { StakesRepository } from "@/lib/repositories/stakes";
import { SettingsRepository } from "@/lib/repositories/settings";
import { setItem, PIT_SESSIONS, PIT_LOCATIONS, PIT_STAKES, PIT_SETTINGS } from "@/lib/storage/localStorage";

export async function POST(req: NextRequest) {
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

  setItem(PIT_SESSIONS, body.sessions);
  setItem(PIT_LOCATIONS, body.locations);
  setItem(PIT_STAKES, body.stakes);
  if (body.settings) setItem(PIT_SETTINGS, body.settings);

  // suppress unused import warnings — repositories used in V2 when setItem is replaced
  void SessionRepository;
  void LocationRepository;
  void StakesRepository;
  void SettingsRepository;

  return Response.json({
    imported: {
      sessions: body.sessions.length,
      locations: body.locations.length,
      stakes: body.stakes.length,
    },
  });
}
