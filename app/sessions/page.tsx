"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Session } from "@/lib/types";
import { getSessions } from "@/lib/client/sessions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPnl(pl: number | null): { text: string; className: string } {
  if (pl === null) return { text: "—", className: "text-zinc-400" };
  if (pl > 0) return { text: `+$${pl.toFixed(2)}`, className: "text-emerald-400" };
  if (pl < 0) return { text: `-$${Math.abs(pl).toFixed(2)}`, className: "text-red-400" };
  return { text: "$0.00", className: "text-zinc-400" };
}

function formatHours(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("all");
  const [stakesFilter, setStakesFilter] = useState("all");

  useEffect(() => {
    function load() {
      setLoading(true);
      getSessions().then((all) => {
        setSessions(all.filter((s) => s.status === "closed"));
        setLoading(false);
      });
    }

    load();

    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) load();
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const locations = useMemo(
    () => [...new Set(sessions.map((s) => s.location_name))].sort(),
    [sessions]
  );
  const stakes = useMemo(
    () => [...new Set(sessions.map((s) => s.stakes_label))].sort(),
    [sessions]
  );

  const filtered = useMemo(
    () =>
      sessions.filter(
        (s) =>
          (locationFilter === "all" || s.location_name === locationFilter) &&
          (stakesFilter === "all" || s.stakes_label === stakesFilter)
      ),
    [sessions, locationFilter, stakesFilter]
  );

  const isFiltered = locationFilter !== "all" || stakesFilter !== "all";

  const totalPnl = filtered.reduce((sum, s) => sum + (s.profit_loss ?? 0), 0);
  const totalMins = filtered.reduce((sum, s) => sum + (s.duration_mins ?? 0), 0);
  const pnlSummary = formatPnl(filtered.length > 0 ? totalPnl : null);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 pb-12 pt-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">Session History</h1>

        {!loading && sessions.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select
                value={stakesFilter}
                onChange={(e) => setStakesFilter(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Stakes</option>
                {stakes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {isFiltered && (
                <button
                  onClick={() => { setLocationFilter("all"); setStakesFilter("all"); }}
                  className="shrink-0 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
              <span className="flex-1 text-zinc-400">{filtered.length} session{filtered.length !== 1 ? "s" : ""}</span>
              <span className={`flex-1 text-center font-medium ${pnlSummary.className}`}>{pnlSummary.text}</span>
              <span className="flex-1 text-right text-zinc-400">{totalMins > 0 ? formatHours(totalMins) : "0m"}</span>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-zinc-500">Loading…</p>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">No sessions yet.</p>
            <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
              Log your first session →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">No sessions match the selected filters.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((s) => {
              const pnl = formatPnl(s.profit_loss);
              return (
                <li key={s.id}>
                  <Link
                    href={`/sessions/${s.id}`}
                    className="flex items-start justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {s.ended_at ? formatDate(s.ended_at) : "—"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-zinc-400">
                        {s.location_name} · {s.stakes_label}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-semibold ${pnl.className}`}>{pnl.text}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
