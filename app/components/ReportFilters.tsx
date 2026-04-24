"use client";

import { FilterState, TimeRangePreset } from "@/lib/types";

const PRESETS: { value: TimeRangePreset; label: string }[] = [
  { value: "all", label: "All" },
  { value: "last30", label: "30d" },
  { value: "last90", label: "3m" },
  { value: "last180", label: "6m" },
  { value: "last365", label: "1yr" },
  { value: "custom", label: "Custom" },
];

interface Props {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  locations: string[];
  stakes: string[];
}

export default function ReportFilters({
  filter,
  onChange,
  locations,
  stakes,
}: Props) {
  function set(patch: Partial<FilterState>) {
    onChange({ ...filter, ...patch });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => set({ timeRange: p.value })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter.timeRange === p.value
                ? "bg-emerald-600 text-white"
                : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filter.timeRange === "custom" && (
        <div className="flex gap-2">
          <input
            type="date"
            value={filter.customStart ?? ""}
            onChange={(e) => set({ customStart: e.target.value || null })}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
          <span className="self-center text-zinc-500">–</span>
          <input
            type="date"
            value={filter.customEnd ?? ""}
            onChange={(e) => set({ customEnd: e.target.value || null })}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}

      <div className="flex gap-2">
        <select
          value={filter.location}
          onChange={(e) => set({ location: e.target.value })}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={filter.stakes}
          onChange={(e) => set({ stakes: e.target.value })}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">All Stakes</option>
          {stakes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
