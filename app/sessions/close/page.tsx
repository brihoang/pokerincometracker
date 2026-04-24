"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Session } from "@/lib/types";
import { getOpenSession, updateSession } from "@/lib/client/sessions";

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
  const [loading, setLoading] = useState(true);

  const [cashOut, setCashOut] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<Rating | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getOpenSession().then((s) => {
      if (!s) {
        router.replace("/");
        return;
      }
      setSession(s);
      setStartedAt(toDatetimeLocal(s.started_at));
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (!session) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const endedAt = new Date().toISOString();
    const startedAtISO = new Date(startedAt).toISOString();

    if (new Date(endedAt) <= new Date(startedAtISO)) {
      setError("End time must be after start time.");
      return;
    }

    const cashOutNum = parseFloat(cashOut);
    if (isNaN(cashOutNum) || cashOutNum < 0) {
      setError("Cash-out must be a valid amount (0 or more).");
      return;
    }

    setSubmitting(true);
    try {
      await updateSession(session!.id, {
        cash_out: cashOutNum,
        ended_at: endedAt,
        started_at: startedAtISO,
        notes: notes.trim() || null,
        rating,
        status: "closed",
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Close Session</h1>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">Cancel</Link>
        </div>

        <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">
            {session.location_name} · {session.stakes_label} · ${session.buy_in} buy-in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="cashOut" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Cash-out amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
              <input
                id="cashOut"
                type="number"
                min="0"
                step="0.01"
                required
                value={cashOut}
                onChange={(e) => setCashOut(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-3 pl-7 pr-4 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="startedAt" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Start time
            </label>
            <input
              id="startedAt"
              type="datetime-local"
              required
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-zinc-300">
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
