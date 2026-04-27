import { Location } from "@/lib/types";
import { waitForAuth } from "./auth";
import { getItem, setItem, PIT_LOCATIONS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/uuid";

export async function getLocations(): Promise<Location[]> {
  if (await waitForAuth()) return fetch("/api/locations").then((r) => r.json());
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  return locations.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createLocation(name: string): Promise<Location> {
  if (await waitForAuth()) {
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  const now = new Date().toISOString();
  const location: Location = { id: generateId(), name: name.trim(), created_at: now, updated_at: now };
  setItem(PIT_LOCATIONS, [...locations, location]);
  return location;
}

export async function updateLocation(id: string, name: string): Promise<Location> {
  if (await waitForAuth()) {
    const res = await fetch(`/api/locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  const updated = locations.map((l) =>
    l.id === id ? { ...l, name: name.trim(), updated_at: new Date().toISOString() } : l
  );
  setItem(PIT_LOCATIONS, updated);
  return updated.find((l) => l.id === id)!;
}

export async function deleteLocation(id: string): Promise<void> {
  if (await waitForAuth()) {
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    return;
  }
  const locations = getItem<Location[]>(PIT_LOCATIONS) ?? [];
  setItem(PIT_LOCATIONS, locations.filter((l) => l.id !== id));
}
