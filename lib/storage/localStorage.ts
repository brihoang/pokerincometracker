export const PIT_SESSIONS = "PIT_SESSIONS";
export const PIT_LOCATIONS = "PIT_LOCATIONS";
export const PIT_STAKES = "PIT_STAKES";
export const PIT_SETTINGS = "PIT_SETTINGS";

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
