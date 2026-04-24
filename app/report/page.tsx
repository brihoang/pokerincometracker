"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Session } from "@/lib/types";
import { getSessions } from "@/lib/client/sessions";
import StatsStrip from "@/app/components/StatsStrip";

export default function ReportPage() {
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
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">← Home</Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Report</h1>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500">Loading…</p>
        ) : (
          <StatsStrip sessions={sessions} />
        )}
      </div>
    </main>
  );
}
