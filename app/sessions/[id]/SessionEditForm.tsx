"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import { updateSession } from "@/lib/client/sessions";
import { Rating, RATINGS, toDatetimeLocal } from "./utils";

interface Props {
  session: Session;
  onSaved: (updated: Session) => void;
  onCancel: () => void;
}

export default function SessionEditForm({ session, onSaved, onCancel }: Props) {
  const [startedAt, setStartedAt] = useState(toDatetimeLocal(session.started_at));
  const [endedAt, setEndedAt] = useState(
    session.ended_at ? toDatetimeLocal(session.ended_at) : toDatetimeLocal(new Date().toISOString())
  );
  const [buyIn, setBuyIn] = useState(String(session.buy_in));
  const [cashOut, setCashOut] = useState(session.cash_out != null ? String(session.cash_out) : "");
  const [notes, setNotes] = useState(session.notes ?? "");
  const [rating, setRating] = useState<Rating | null>(session.rating as Rating | null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const startedAtISO = new Date(startedAt).toISOString();
    const endedAtISO = new Date(endedAt).toISOString();

    if (new Date(endedAtISO) <= new Date(startedAtISO)) {
      setError("End time must be after start time.");
      return;
    }

    const buyInNum = parseFloat(buyIn);
    if (isNaN(buyInNum) || buyInNum <= 0) {
      setError("Buy-in must be a valid amount greater than 0.");
      return;
    }

    const cashOutNum = parseFloat(cashOut);
    if (isNaN(cashOutNum) || cashOutNum < 0) {
      setError("Cash-out must be a valid amount (0 or more).");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateSession(session.id, {
        started_at: startedAtISO,
        ended_at: endedAtISO,
        buy_in: buyInNum,
        cash_out: cashOutNum,
        notes: notes.trim() || null,
        rating,
        status: "closed",
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Edit Session</h1>
          <button onClick={onCancel} className="text-sm text-zinc-500 hover:text-zinc-300">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <p className="text-sm font-medium text-zinc-400">
            {session.location_name} · {session.stakes_label}
          </p>

          <div>
            <label htmlFor="buyIn" className="mb-1.5 block text-sm font-medium text-zinc-300">Buy-in ($)</label>
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
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label htmlFor="cashOut" className="mb-1.5 block text-sm font-medium text-zinc-300">Cash-out ($)</label>
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
            <label htmlFor="startedAt" className="mb-1.5 block text-sm font-medium text-zinc-300">Start time</label>
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
            <label htmlFor="endedAt" className="mb-1.5 block text-sm font-medium text-zinc-300">End time</label>
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
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Notes <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
