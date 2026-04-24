export const PIT_SESSIONS = "pit_sessions";
export const PIT_LOCATIONS = "pit_locations";
export const PIT_STAKES = "pit_stakes";
export const PIT_SETTINGS = "pit_settings";

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
