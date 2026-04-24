"use client";

import { useEffect, useState } from "react";
import { Location, Stakes } from "@/lib/types";
import { getSettings, updateSettings } from "@/lib/client/settings";

interface Props {
  locations: Location[];
  stakes: Stakes[];
}

export default function AppSettingsManager({ locations, stakes }: Props) {
  const [defaultLocationId, setDefaultLocationId] = useState<string>("");
  const [defaultStakesId, setDefaultStakesId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      setDefaultLocationId(settings.default_location_id ?? "");
      setDefaultStakesId(settings.default_stakes_id ?? "");
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      await updateSettings({
        default_location_id: defaultLocationId || null,
        default_stakes_id: defaultStakesId || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="default-location" className="text-sm font-medium text-zinc-300">
          Default Location
        </label>
        <select
          id="default-location"
          value={defaultLocationId}
          onChange={(e) => setDefaultLocationId(e.target.value)}
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white"
        >
          <option value="">None</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="default-stakes" className="text-sm font-medium text-zinc-300">
          Default Stakes
        </label>
        <select
          id="default-stakes"
          value={defaultStakesId}
          onChange={(e) => setDefaultStakesId(e.target.value)}
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white"
        >
          <option value="">None</option>
          {stakes.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {saved ? "Saved!" : submitting ? "Saving…" : "Save Defaults"}
      </button>
    </form>
  );
}
