import { Location } from "@/lib/types";
import { getItem, setItem, PIT_LOCATIONS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/uuid";

function getAll(): Location[] {
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  return locations.sort((a, b) => a.name.localeCompare(b.name));
}

function getById(id: string): Location | null {
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  return locations.find((l) => l.id === id) ?? null;
}

function create(data: { name: string }): Location {
  if (!data.name.trim()) throw new Error("Location name is required");
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  const now = new Date().toISOString();
  const location: Location = {
    id: generateId(),
    name: data.name.trim(),
    created_at: now,
    updated_at: now,
  };
  setItem(PIT_LOCATIONS, [...locations, location]);
  return location;
}

function update(id: string, data: { name: string }): Location | null {
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  const index = locations.findIndex((l) => l.id === id);
  if (index === -1) return null;
  const updated: Location = {
    ...locations[index],
    name: data.name.trim(),
    updated_at: new Date().toISOString(),
  };
  locations[index] = updated;
  setItem(PIT_LOCATIONS, locations);
  return updated;
}

function remove(id: string): boolean {
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  const filtered = locations.filter((l) => l.id !== id);
  if (filtered.length === locations.length) return false;
  setItem(PIT_LOCATIONS, filtered);
  return true;
}

export const LocationRepository = { getAll, getById, create, update, delete: remove };
