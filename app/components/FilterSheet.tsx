"use client";

import { useEffect, useState } from "react";
import { FilterState } from "@/lib/types";
import ReportFilters from "./ReportFilters";

interface Props {
  open: boolean;
  onClose: () => void;
  filter: FilterState;
  onApply: (f: FilterState) => void;
  locations: string[];
  stakes: string[];
}

export default function FilterSheet({ open, onClose, filter, onApply, locations, stakes }: Props) {
  const [draft, setDraft] = useState<FilterState>(filter);

  useEffect(() => {
    if (open) {
      setDraft(filter);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, filter]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-zinc-800 bg-zinc-950 px-4 pb-8 pt-4 transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Filters</h2>
          <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white">✕</button>
        </div>

        <ReportFilters filter={draft} onChange={setDraft} locations={locations} stakes={stakes} />

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => {
              const cleared: FilterState = { location: "all", stakes: "all", timeRange: "all", customStart: null, customEnd: null };
              setDraft(cleared);
              onApply(cleared);
              onClose();
            }}
            className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white"
          >
            Clear
          </button>
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
