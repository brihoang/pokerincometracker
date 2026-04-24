"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Session, FilterState, YAxisMode } from "@/lib/types";
import { getSessions } from "@/lib/client/sessions";
import StatsStrip from "@/app/components/StatsStrip";
import CumulativePnlChart from "@/app/components/CumulativePnlChart";
import ReportFilters from "@/app/components/ReportFilters";
import FilterSheet from "@/app/components/FilterSheet";

const DEFAULT_FILTER: FilterState = {
  location: "all",
  stakes: "all",
  timeRange: "all",
  customStart: null,
  customEnd: null,
};

function filterSessions(sessions: Session[], filter: FilterState): Session[] {
  return sessions.filter((s) => {
    if (filter.location !== "all" && s.location_name !== filter.location) return false;
    if (filter.stakes !== "all" && s.stakes_label !== filter.stakes) return false;
    if (filter.timeRange !== "all" && filter.timeRange !== "custom") {
      const days = { last30: 30, last90: 90, last180: 180, last365: 365 }[filter.timeRange];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (!s.ended_at || new Date(s.ended_at) < cutoff) return false;
    }
    if (filter.timeRange === "custom") {
      if (filter.customStart && s.ended_at && new Date(s.ended_at) < new Date(filter.customStart)) return false;
      if (filter.customEnd && s.ended_at && new Date(s.ended_at) > new Date(filter.customEnd)) return false;
    }
    return true;
  });
}

function activeFilterCount(filter: FilterState): number {
  let count = 0;
  if (filter.location !== "all") count++;
  if (filter.stakes !== "all") count++;
  if (filter.timeRange !== "all") count++;
  return count;
}

export default function ReportPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [yAxisMode, setYAxisMode] = useState<YAxisMode>("currency");

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

  const filteredSessions = useMemo(() => filterSessions(sessions, filter), [sessions, filter]);
  const filterCount = activeFilterCount(filter);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">← Home</Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Report</h1>
        </div>

        {!loading && sessions.length > 0 && (
          <>
            {/* Desktop inline filters */}
            <div className="mb-4 hidden sm:block">
              <ReportFilters filter={filter} onChange={setFilter} locations={locations} stakes={stakes} />
            </div>

            {/* Mobile filter button */}
            <div className="mb-4 sm:hidden">
              <button
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              >
                Filters
                {filterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-medium text-white">
                    {filterCount}
                  </span>
                )}
              </button>
            </div>
          </>
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
        ) : (
          <div className="space-y-4">
            <CumulativePnlChart sessions={filteredSessions} mode={yAxisMode} onModeChange={setYAxisMode} />
            <StatsStrip sessions={filteredSessions} mode={yAxisMode} />
          </div>
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filter={filter}
        onApply={setFilter}
        locations={locations}
        stakes={stakes}
      />
    </main>
  );
}
