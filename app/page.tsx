"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Location, Stakes, Session } from "@/lib/types";
import { getLocations } from "@/lib/client/locations";
import { getStakes } from "@/lib/client/stakes";
import { getOpenSession, getSessions } from "@/lib/client/sessions";
import StartSessionForm from "@/app/components/StartSessionForm";
import StatsStrip from "@/app/components/StatsStrip";

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stakes, setStakes] = useState<Stakes[]>([]);
  const [openSession, setOpenSession] = useState<Session | null>(null);
  const [closedSessions, setClosedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function load() {
      setLoading(true);
      Promise.all([getLocations(), getStakes(), getOpenSession(), getSessions()]).then(([locs, stks, session, all]) => {
        setLocations(locs);
        setStakes(stks);
        setOpenSession(session);
        setClosedSessions(all.filter((s) => s.status === "closed"));
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

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Poker Tracker</h1>
          <div className="flex items-center gap-4">
            <Link href="/sessions" className="text-sm text-zinc-500 hover:text-zinc-300">History</Link>
            <Link href="/report" className="text-sm text-zinc-500 hover:text-zinc-300">Report</Link>
            <Link href="/settings" className="text-sm text-zinc-500 hover:text-zinc-300">Settings</Link>
          </div>
        </div>

        {openSession ? (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-5 text-center">
            <p className="text-zinc-400">A session is already in progress.</p>
            <Link href="/sessions/close" className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
              Close session →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-5 text-lg font-semibold text-white">Start Session</h2>
            <StartSessionForm
              locations={locations}
              stakes={stakes}
              onSessionStarted={(session) => setOpenSession(session)}
            />
          </div>
        )}

        <div className="mt-6">
          <StatsStrip sessions={closedSessions} />
        </div>
      </div>
    </main>
  );
}
