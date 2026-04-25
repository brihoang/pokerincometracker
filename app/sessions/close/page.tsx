"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Session, Location, Stakes } from "@/lib/types";
import { getOpenSession, updateSession } from "@/lib/client/sessions";
import { getLocations } from "@/lib/client/locations";
import { getStakes } from "@/lib/client/stakes";

type Rating = "good" | "neutral" | "bad";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const RATINGS: { value: Rating; label: string }[] = [
  { value: "good", label: "Good" },
  { value: "neutral", label: "Neutral" },
  { value: "bad", label: "Bad" },
];

export default function CloseSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stakes, setStakes] = useState<Stakes[]>([]);
  const [loading, setLoading] = useState(true);

  const [locationId, setLocationId] = useState("");
  const [stakesId, setStakesId] = useState("");
  const [buyIn, setBuyIn] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState(() =>
    toDatetimeLocal(new Date().toISOString()),
  );
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<Rating | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function load() {
      setLoading(true);
      Promise.all([getOpenSession(), getLocations(), getStakes()]).then(
        ([s, locs, stks]) => {
          if (!s) {
            router.replace("/");
            return;
          }
          setSession(s);
          setLocations(locs);
          setStakes(stks);
          setLocationId(s.location_id);
          setStakesId(s.stakes_id);
          setBuyIn(String(s.buy_in));
          setStartedAt(toDatetimeLocal(s.started_at));
          setNotes(s.notes ?? "");
          setLoading(false);
        },
      );
    }

    load();

    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) load();
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (!session) return null;

  const sessionMins =
    startedAt && endedAt
      ? Math.floor(
          (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000,
        )
      : null;
  const showShortWarning =
    sessionMins !== null && sessionMins >= 0 && sessionMins < 15;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const endedAtISO = new Date(endedAt).toISOString();
    const startedAtISO = new Date(startedAt).toISOString();

    if (new Date(endedAtISO) <= new Date(startedAtISO)) {
      setError("End time must be after start time.");
      return;
    }

    const cashOutNum = parseFloat(cashOut);
    if (isNaN(cashOutNum) || cashOutNum < 0) {
      setError("Cash-out must be a valid amount (0 or more).");
      return;
    }

    const buyInNum = parseFloat(buyIn);
    if (isNaN(buyInNum) || buyInNum <= 0) {
      setError("Buy-in must be a valid amount greater than 0.");
      return;
    }

    const location = locations.find((l) => l.id === locationId);
    const stake = stakes.find((s) => s.id === stakesId);

    setSubmitting(true);
    try {
      await updateSession(session!.id, {
        location_id: locationId,
        location_name: location?.name ?? session!.location_name,
        stakes_id: stakesId,
        stakes_label: stake?.label ?? session!.stakes_label,
        buy_in: buyInNum,
        cash_out: cashOutNum,
        ended_at: endedAtISO,
        started_at: startedAtISO,
        notes: notes.trim() || null,
        rating,
        status: "closed",
      });
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Close Session
          </h1>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Location
            </label>
            <select
              id="location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="stakes"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Stakes
            </label>
            <select
              id="stakes"
              value={stakesId}
              onChange={(e) => setStakesId(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
            >
              {stakes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="buyIn"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Buy-in ($)
            </label>
            <input
              id="buyIn"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label
              htmlFor="cashOut"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Cash-out ($)
            </label>
            <input
              id="cashOut"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              value={cashOut}
              onChange={(e) => setCashOut(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0.00"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label
              htmlFor="startedAt"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Start time
            </label>
            <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 focus-within:border-emerald-500">
              <input
                id="startedAt"
                type="datetime-local"
                required
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="endedAt"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              End time
            </label>
            <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 focus-within:border-emerald-500">
              <input
                id="endedAt"
                type="datetime-local"
                required
                value={endedAt}
                onChange={(e) => setEndedAt(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Notes <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session go?"
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-300">
              Rating <span className="text-zinc-500">(optional)</span>
            </p>
            <div className="flex gap-2">
              {RATINGS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(rating === value ? null : value)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    rating === value
                      ? "border-emerald-500 bg-emerald-900 text-emerald-300"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {showShortWarning && (
            <p className="rounded-lg border border-yellow-700 bg-yellow-950 px-4 py-3 text-sm text-yellow-400">
              This session is only {sessionMins}{" "}
              {sessionMins === 1 ? "minute" : "minutes"} long — are you sure?
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Closing…" : "Close Session"}
          </button>
        </form>
      </div>
    </main>
  );
}
