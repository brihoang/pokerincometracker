import { getItem, setItem, PIT_SESSIONS, PIT_LOCATIONS, PIT_STAKES, PIT_SETTINGS } from "@/lib/storage/localStorage";
import { AppSettings, Location, Session, Stakes } from "@/lib/types";

export interface ExportPayload {
  version: "1";
  exported_at: string;
  sessions: Session[];
  locations: Location[];
  stakes: Stakes[];
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency_symbol: "$",
  default_location_id: null,
  default_stakes_id: null,
};

export function exportData(): void {
  const payload: ExportPayload = {
    version: "1",
    exported_at: new Date().toISOString(),
    sessions: getItem<Session[]>(PIT_SESSIONS) ?? [],
    locations: getItem<Location[]>(PIT_LOCATIONS) ?? [],
    stakes: getItem<Stakes[]>(PIT_STAKES) ?? [],
    settings: getItem<AppSettings>(PIT_SETTINGS) ?? { ...DEFAULT_SETTINGS },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `poker-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(payload: unknown): { imported: { sessions: number; locations: number; stakes: number } } {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid file format — expected a JSON object");
  }
  const data = payload as Record<string, unknown>;

  if (data.version && data.version !== "1") {
    throw new Error(`Unsupported export version: ${data.version}`);
  }
  if (!Array.isArray(data.sessions)) {
    throw new Error("Missing or invalid 'sessions' array");
  }
  if (!Array.isArray(data.locations)) {
    throw new Error("Missing or invalid 'locations' array");
  }
  if (!Array.isArray(data.stakes)) {
    throw new Error("Missing or invalid 'stakes' array");
  }

  for (let i = 0; i < data.sessions.length; i++) {
    const s = data.sessions[i] as Record<string, unknown>;
    if (!s.id || !s.started_at || s.buy_in == null || !s.status) {
      throw new Error(`Session at index ${i} is missing required fields (id, started_at, buy_in, status)`);
    }
  }

  setItem(PIT_SESSIONS, data.sessions);
  setItem(PIT_LOCATIONS, data.locations);
  setItem(PIT_STAKES, data.stakes);
  if (data.settings) setItem(PIT_SETTINGS, data.settings);

  return {
    imported: {
      sessions: data.sessions.length,
      locations: data.locations.length,
      stakes: data.stakes.length,
    },
  };
}
