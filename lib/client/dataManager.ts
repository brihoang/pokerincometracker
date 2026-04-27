import { getItem, setItem, PIT_SESSIONS, PIT_LOCATIONS, PIT_STAKES, PIT_SETTINGS } from "@/lib/storage/localStorage";
import { AppSettings, Location, Session, Stakes } from "@/lib/types";
import { waitForAuth } from "@/lib/client/auth";

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

function buildLocalPayload(): ExportPayload {
  return {
    version: "1",
    exported_at: new Date().toISOString(),
    sessions: getItem<Session[]>(PIT_SESSIONS) ?? [],
    locations: getItem<Location[]>(PIT_LOCATIONS) ?? [],
    stakes: getItem<Stakes[]>(PIT_STAKES) ?? [],
    settings: getItem<AppSettings>(PIT_SETTINGS) ?? { ...DEFAULT_SETTINGS },
  };
}

export function hasLocalData(): boolean {
  if (typeof window === "undefined") return false;
  const s = getItem<Session[]>(PIT_SESSIONS) ?? [];
  const l = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  const st = getItem<Stakes[]>(PIT_STAKES) ?? [];
  const se = getItem<AppSettings>(PIT_SETTINGS);
  return s.length > 0 || l.length > 0 || st.length > 0 || se !== null;
}

export function clearLocalData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PIT_SESSIONS);
  localStorage.removeItem(PIT_LOCATIONS);
  localStorage.removeItem(PIT_STAKES);
  localStorage.removeItem(PIT_SETTINGS);
}

export function getLocalPayload(): ExportPayload {
  return buildLocalPayload();
}

export function exportData(): void {
  const payload = buildLocalPayload();
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

export async function deleteAllData(): Promise<void> {
  const loggedIn = await waitForAuth();
  if (loggedIn) {
    const res = await fetch("/api/data", { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete data");
    return;
  }
  clearLocalData();
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
