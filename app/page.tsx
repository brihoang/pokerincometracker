"use client";

import { useEffect, useState } from "react";
import { Location, Stakes, Session } from "@/lib/types";
import { getLocations } from "@/lib/client/locations";
import { getStakes } from "@/lib/client/stakes";
import { getOpenSession } from "@/lib/client/sessions";
import StartSessionForm from "@/app/components/StartSessionForm";

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stakes, setStakes] = useState<Stakes[]>([]);
  const [openSession, setOpenSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLocations(), getStakes(), getOpenSession()]).then(([locs, stks, session]) => {
      setLocations(locs);
      setStakes(stks);
      setOpenSession(session);
      setLoading(false);
    });
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
          <a href="/settings" className="text-sm text-zinc-500 hover:text-zinc-300">Settings</a>
        </div>

        {openSession ? (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-5 text-center">
            <p className="text-zinc-400">A session is already in progress.</p>
            <a href="/sessions/close" className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
              Close session →
            </a>
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
      </div>
    </main>
  );
}
