"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Session } from "@/lib/types";
import { getSessionById, updateSession } from "@/lib/client/sessions";

type Rating = "good" | "neutral" | "bad";

const RATINGS: { value: Rating; label: string }[] = [
  { value: "good", label: "Good" },
  { value: "neutral", label: "Neutral" },
  { value: "bad", label: "Bad" },
];

const RATING_LABEL: Record<string, string> = {
  good: "Good",
  neutral: "Neutral",
  bad: "Bad",
};
const RATING_COLOR: Record<string, string> = {
  good: "text-emerald-400",
  neutral: "text-zinc-400",
  bad: "text-red-400",
};

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(mins: number | null): string {
  if (mins === null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatPnl(pl: number | null): { text: string; className: string } {
  if (pl === null) return { text: "—", className: "text-zinc-400" };
  if (pl > 0)
    return { text: `+$${pl.toFixed(2)}`, className: "text-emerald-400" };
  if (pl < 0)
    return { text: `-$${Math.abs(pl).toFixed(2)}`, className: "text-red-400" };
  return { text: "$0.00", className: "text-zinc-400" };
}

function DetailRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-sm font-medium ${valueClass ?? "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [buyIn, setBuyIn] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<Rating | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSessionById(id).then((s) => {
      if (!s) {
        router.replace("/sessions");
        return;
      }
      setSession(s);
      setLoading(false);
    });
  }, [id, router]);

  function enterEdit() {
    if (!session) return;
    setStartedAt(toDatetimeLocal(session.started_at));
    setEndedAt(
      session.ended_at
        ? toDatetimeLocal(session.ended_at)
        : toDatetimeLocal(new Date().toISOString()),
    );
    setBuyIn(String(session.buy_in));
    setCashOut(session.cash_out != null ? String(session.cash_out) : "");
    setNotes(session.notes ?? "");
    setRating(session.rating as Rating | null);
    setError(null);
    setMode("edit");
  }

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
      const updated = await updateSession(id, {
        started_at: startedAtISO,
        ended_at: endedAtISO,
        buy_in: buyInNum,
        cash_out: cashOutNum,
        notes: notes.trim() || null,
        rating,
        status: "closed",
      });
      setSession(updated);
      setMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (!session) return null;

  const pnl = formatPnl(session.profit_loss);
  const plPerHour = session.duration_mins
    ? formatPnl((session.profit_loss ?? 0) / (session.duration_mins / 60))
    : { text: "—", className: "text-zinc-400" };

  const bbPerHour: { text: string; className: string } = (() => {
    if (!session.big_blind || !session.duration_mins) return { text: "—", className: "text-zinc-400" };
    const val = ((session.profit_loss ?? 0) / session.big_blind) / (session.duration_mins / 60);
    const rounded = Math.round(val * 10) / 10;
    if (val > 0) return { text: `+${rounded} BB/hr`, className: "text-emerald-400" };
    if (val < 0) return { text: `${rounded} BB/hr`, className: "text-red-400" };
    return { text: "0 BB/hr", className: "text-zinc-400" };
  })();

  if (mode === "edit") {
    return (
      <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-zinc-950 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Edit Session
            </h1>
            <button
              onClick={() => setMode("view")}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <p className="mb-1.5 text-sm font-medium text-zinc-400">
                {session.location_name} · {session.stakes_label}
              </p>
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
              <label
                htmlFor="cashOut"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Cash-out ($)
              </label>
              <input
                id="cashOut"
                type="number"
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
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/sessions"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← History
          </Link>
          <button
            onClick={enterEdit}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            Edit
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
          <DetailRow
            label="Date"
            value={session.ended_at ? formatDatetime(session.ended_at) : "—"}
          />
          <DetailRow label="Location" value={session.location_name} />
          <DetailRow label="Stakes" value={session.stakes_label} />
          <DetailRow label="Buy-in" value={`$${session.buy_in.toFixed(2)}`} />
          <DetailRow
            label="Cash-out"
            value={
              session.cash_out != null ? `$${session.cash_out.toFixed(2)}` : "—"
            }
          />
          <DetailRow
            label="Profit/Loss"
            value={pnl.text}
            valueClass={pnl.className}
          />
          <DetailRow
            label="Profit/Loss per Hour"
            value={plPerHour.text}
            valueClass={plPerHour.className}
          />
          <DetailRow
            label="BB/hr"
            value={bbPerHour.text}
            valueClass={bbPerHour.className}
          />
          <DetailRow
            label="Duration"
            value={formatDuration(session.duration_mins)}
          />
          <DetailRow
            label="Started"
            value={formatDatetime(session.started_at)}
          />
          {session.rating && (
            <DetailRow
              label="Rating"
              value={RATING_LABEL[session.rating]}
              valueClass={RATING_COLOR[session.rating]}
            />
          )}
          {session.notes && (
            <div className="py-3 border-b border-zinc-800 last:border-0">
              <p className="mb-1 text-sm text-zinc-400">Notes</p>
              <p className="text-sm text-white whitespace-pre-wrap">
                {session.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
