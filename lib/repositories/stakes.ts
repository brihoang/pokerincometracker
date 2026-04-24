import type { Stakes } from "@/lib/types";
import { getItem, setItem, PIT_STAKES } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/uuid";

type CreateInput = Omit<Stakes, "id" | "created_at" | "updated_at">;
type UpdateInput = Partial<Omit<Stakes, "id" | "created_at" | "updated_at">>;

function load(): Stakes[] {
  return getItem<Stakes[]>(PIT_STAKES) ?? [];
}

function save(stakes: Stakes[]): void {
  setItem(PIT_STAKES, stakes);
}

export const StakesRepository = {
  getAll(): Stakes[] {
    return load().sort((a, b) => {
      if (a.small_blind === null && b.small_blind === null) {
        return a.label.localeCompare(b.label);
      }
      if (a.small_blind === null) return 1;
      if (b.small_blind === null) return -1;
      if (a.small_blind !== b.small_blind) return a.small_blind - b.small_blind;
      return a.label.localeCompare(b.label);
    });
  },

  getById(id: string): Stakes | null {
    return load().find((s) => s.id === id) ?? null;
  },

  create(data: CreateInput): Stakes {
    if (!data.label.trim()) throw new Error("label is required");
    const now = new Date().toISOString();
    const entry: Stakes = { ...data, id: generateId(), created_at: now, updated_at: now };
    const all = load();
    all.push(entry);
    save(all);
    return entry;
  },

  update(id: string, data: UpdateInput): Stakes | null {
    const all = load();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...data, updated_at: new Date().toISOString() };
    all[idx] = updated;
    save(all);
    return updated;
  },

  delete(id: string): boolean {
    const all = load();
    const next = all.filter((s) => s.id !== id);
    if (next.length === all.length) return false;
    save(next);
    return true;
  },
};
