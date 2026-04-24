"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Location, Stakes, Session, AppSettings } from "@/lib/types";
import { createSession } from "@/lib/client/sessions";
import { getSettings } from "@/lib/client/settings";

interface Props {
  locations: Location[];
  stakes: Stakes[];
  onSessionStarted: (session: Session) => void;
}

export default function StartSessionForm({ locations, stakes, onSessionStarted }: Props) {
  const [locationId, setLocationId] = useState("");
  const [stakesId, setStakesId] = useState("");
  const [buyIn, setBuyIn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const hasLocations = locations.length > 0;
  const hasStakes = stakes.length > 0;
  const isValid = locationId && stakesId && buyIn && parseFloat(buyIn) >= 0.01;

  const hasDefaults =
    settings !== null &&
    (settings.default_location_id !== null || settings.default_stakes_id !== null);

  function applyDefaults() {
    if (!settings) return;
    if (settings.default_location_id) setLocationId(settings.default_location_id);
    if (settings.default_stakes_id) setStakesId(settings.default_stakes_id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setError(null);

    const location = locations.find((l) => l.id === locationId);
    const stake = stakes.find((s) => s.id === stakesId);
    if (!location || !stake) return;

    setSubmitting(true);
    try {
      const session = await createSession({
        location_id: location.id,
        location_name: location.name,
        stakes_id: stake.id,
        stakes_label: stake.label,
        buy_in: parseFloat(buyIn),
        started_at: new Date().toISOString(),
      });
      onSessionStarted(session);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasLocations || !hasStakes) {
    return (
      <div className="text-center">
        <p className="text-zinc-400">
          {!hasLocations && !hasStakes
            ? "No locations or stakes configured."
            : !hasLocations
              ? "No locations configured."
              : "No stakes configured."}
        </p>
        <Link href="/settings" className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
          Go to Settings to add them →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {hasDefaults && (
        <button
          type="button"
          onClick={applyDefaults}
          className="h-10 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Use Defaults
        </button>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-medium text-zinc-300">Location</label>
        <select
          id="location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          disabled={submitting}
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white disabled:opacity-50"
        >
          <option value="">Select a location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="stakes" className="text-sm font-medium text-zinc-300">Stakes</label>
        <select
          id="stakes"
          value={stakesId}
          onChange={(e) => setStakesId(e.target.value)}
          disabled={submitting}
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white disabled:opacity-50"
        >
          <option value="">Select stakes</option>
          {stakes.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="buy-in" className="text-sm font-medium text-zinc-300">Buy-in ($)</label>
        <input
          id="buy-in"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={buyIn}
          onChange={(e) => setBuyIn(e.target.value)}
          disabled={submitting}
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white placeholder-zinc-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !isValid}
        className="mt-1 h-12 rounded-xl bg-emerald-600 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Starting…" : "Start Session"}
      </button>
    </form>
  );
}
