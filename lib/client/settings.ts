import { AppSettings } from "@/lib/types";
import { waitForAuth } from "./auth";
import { getItem, setItem, PIT_SETTINGS } from "@/lib/storage/localStorage";

const defaults: AppSettings = {
  currency_symbol: "$",
  default_location_id: null,
  default_stakes_id: null,
};

export async function getSettings(): Promise<AppSettings> {
  if (await waitForAuth()) return fetch("/api/settings").then((r) => r.json());
  return getItem<AppSettings>(PIT_SETTINGS) ?? { ...defaults };
}

export async function updateSettings(
  data: Partial<Omit<AppSettings, "currency_symbol">>
): Promise<AppSettings> {
  if (await waitForAuth()) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }
  const current = getItem<AppSettings>(PIT_SETTINGS) ?? { ...defaults };
  const updated: AppSettings = { ...current, ...data };
  setItem(PIT_SETTINGS, updated);
  return updated;
}
