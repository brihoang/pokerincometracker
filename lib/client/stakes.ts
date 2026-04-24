import { Stakes } from "@/lib/types";
import { isLoggedIn } from "./auth";
import { getItem, setItem, PIT_STAKES } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/uuid";

export type StakesInput = {
  small_blind: number;
  big_blind: number;
};

export function buildStakesLabel(small_blind: number, big_blind: number): string {
  const fmt = (n: number) => (n % 1 === 0 ? String(n) : String(n));
  return `${fmt(small_blind)}/${fmt(big_blind)}`;
}

export async function getStakes(): Promise<Stakes[]> {
  if (isLoggedIn()) return fetch("/api/stakes").then((r) => r.json());
  const stakes = getItem<Stakes[]>(PIT_STAKES) ?? [];
  return stakes.sort((a, b) => {
    if (a.small_blind !== null && b.small_blind !== null) return a.small_blind - b.small_blind;
    if (a.small_blind === null) return 1;
    if (b.small_blind === null) return -1;
    return a.label.localeCompare(b.label);
  });
}

export async function createStakes({ small_blind, big_blind }: StakesInput): Promise<Stakes> {
  const label = buildStakesLabel(small_blind, big_blind);
  if (isLoggedIn()) {
    const res = await fetch("/api/stakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, small_blind, big_blind }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
  const stakes = getItem<Stakes[]>(PIT_STAKES) ?? [];
  const now = new Date().toISOString();
  const entry: Stakes = { id: generateId(), label, small_blind, big_blind, created_at: now, updated_at: now };
  setItem(PIT_STAKES, [...stakes, entry]);
  return entry;
}

export async function updateStakes(id: string, { small_blind, big_blind }: StakesInput): Promise<Stakes> {
  const label = buildStakesLabel(small_blind, big_blind);
  if (isLoggedIn()) {
    const res = await fetch(`/api/stakes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, small_blind, big_blind }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
  const stakes = getItem<Stakes[]>(PIT_STAKES) ?? [];
  const updated = stakes.map((s) =>
    s.id === id ? { ...s, label, small_blind, big_blind, updated_at: new Date().toISOString() } : s
  );
  setItem(PIT_STAKES, updated);
  return updated.find((s) => s.id === id)!;
}

export async function deleteStakes(id: string): Promise<void> {
  if (isLoggedIn()) {
    await fetch(`/api/stakes/${id}`, { method: "DELETE" });
    return;
  }
  const stakes = getItem<Stakes[]>(PIT_STAKES) ?? [];
  setItem(PIT_STAKES, stakes.filter((s) => s.id !== id));
}
