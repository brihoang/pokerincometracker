import { Session } from "@/lib/types";
import { getItem, setItem, PIT_SESSIONS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/uuid";

type CreateSessionData = Omit<
  Session,
  "id" | "ended_at" | "duration_mins" | "cash_out" | "profit_loss" | "notes" | "rating" | "status" | "created_at" | "updated_at"
> & { big_blind?: number | null };

function getAll(): Session[] {
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  return sessions.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

function getById(id: string): Session | null {
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  return sessions.find((s) => s.id === id) ?? null;
}

function getOpen(): Session | null {
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  return sessions.find((s) => s.status === "open") ?? null;
}

function create(data: CreateSessionData): Session {
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
    status: "open",
    created_at: now,
    updated_at: now,
  };
  setItem(PIT_SESSIONS, [...sessions, session]);
  return session;
}

function update(id: string, data: Partial<Omit<Session, "id" | "created_at">>): Session | null {
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;
  const updated: Session = {
    ...sessions[index],
    ...data,
    id,
    created_at: sessions[index].created_at,
    updated_at: new Date().toISOString(),
  };
  sessions[index] = updated;
  setItem(PIT_SESSIONS, sessions);
  return updated;
}

function remove(id: string): boolean {
  const sessions = getItem<Session[]>(PIT_SESSIONS) ?? [];
  const filtered = sessions.filter((s) => s.id !== id);
  if (filtered.length === sessions.length) return false;
  setItem(PIT_SESSIONS, filtered);
  return true;
}

export const SessionRepository = { getAll, getById, getOpen, create, update, delete: remove };
