import { AppSettings } from "@/lib/types";
import { getItem, setItem, PIT_SETTINGS } from "@/lib/storage/localStorage";

const defaults: AppSettings = {
  currency_symbol: "$",
  default_location_id: null,
  default_stakes_id: null,
};

function get(): AppSettings {
  return getItem<AppSettings>(PIT_SETTINGS) ?? { ...defaults };
}

function update(data: Partial<Omit<AppSettings, "currency_symbol">>): AppSettings {
  const current = get();
  const updated: AppSettings = { ...current, ...data };
  setItem(PIT_SETTINGS, updated);
  return updated;
}

export const SettingsRepository = { get, update };
