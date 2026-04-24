import { Session } from "@/lib/types";
import { isLoggedIn } from "./auth";
import { getItem, setItem, PIT_SESSIONS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/uuid";
import { calcProfitLoss, calcDurationMins } from "@/lib/utils/calculations";

type CreateSessionData = {
  location_id: string;
  location_name: string;
  stakes_id: string;
  stakes_label: string;
  buy_in: number;
  started_at: string;
};

function localGetAll(): Session[] {
  return (getItem<Session[]>(PIT_SESSIONS) ?? []).sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

function localSave(sessions: Session[]): void {
  setItem(PIT_SESSIONS, sessions);
}

export async function getSessions(): Promise<Session[]> {
  if (isLoggedIn()) return fetch("/api/sessions").then((r) => r.json());
  return localGetAll();
}

export async function getOpenSession(): Promise<Session | null> {
  if (isLoggedIn()) {
    const sessions: Session[] = await fetch("/api/sessions?status=open").then((r) => r.json());
    return sessions[0] ?? null;
  }
  return (getItem<Session[]>(PIT_SESSIONS) ?? []).find((s) => s.status === "open") ?? null;
}

export async function createSession(data: CreateSessionData): Promise<Session> {
  if (isLoggedIn()) {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json;
  }
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  const now = new Date().toISOString();
  const session: Session = {
    ...data,
    id: generateId(),
    ended_at: null,
    duration_mins: null,
    cash_out: null,
    profit_loss: null,
    notes: null,
    rating: null,
    game_type: "NLH",
    status: "open",
    created_at: now,
    updated_at: now,
  };
  localSave([...sessions, session]);
  return session;
}

export async function updateSession(
  id: string,
  data: Partial<Omit<Session, "id" | "created_at">>
): Promise<Session> {
  if (isLoggedIn()) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json;
  }
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Session not found");

  const merged = { ...sessions[index], ...data, id, updated_at: new Date().toISOString() };

  // recompute derived fields if closing
  if (merged.cash_out !== null && merged.status === "closed") {
    merged.profit_loss = calcProfitLoss(merged.buy_in, merged.cash_out);
    if (merged.ended_at) {
      merged.duration_mins = calcDurationMins(new Date(merged.started_at), new Date(merged.ended_at));
    }
  }

  sessions[index] = merged;
  localSave(sessions);
  return merged;
}

export async function deleteSession(id: string): Promise<void> {
  if (isLoggedIn()) {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    return;
  }
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  localSave(sessions.filter((s) => s.id !== id));
}
