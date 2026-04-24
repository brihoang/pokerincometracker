"use client";

import { useEffect, useState } from "react";
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
  if (pl > 0)
    return { text: `+$${pl.toFixed(2)}`, className: "text-emerald-400" };
  if (pl < 0)
    return { text: `-$${Math.abs(pl).toFixed(2)}`, className: "text-red-400" };
  return { text: "$0.00", className: "text-zinc-400" };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Session History
          </h1>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500">Loading…</p>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">No sessions yet.</p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Log your first session →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((s) => {
              const pnl = formatPnl(s.profit_loss);
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {s.ended_at ? formatDate(s.ended_at) : "—"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-zinc-400">
                        {s.location_name} · {s.stakes_label}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-semibold ${pnl.className}`}>
                        {pnl.text}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
