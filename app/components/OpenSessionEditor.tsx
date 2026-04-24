"use client";

import { useState } from "react";
import Link from "next/link";
import { Session } from "@/lib/types";
import { updateSession } from "@/lib/client/sessions";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  session: Session;
  onSaved: (s: Session) => void;
}

export default function OpenSessionEditor({ session, onSaved }: Props) {
  const [buyIn, setBuyIn] = useState(String(session.buy_in));
  const [startedAt, setStartedAt] = useState(toDatetimeLocal(session.started_at));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const parsedBuyIn = parseFloat(buyIn);
    if (isNaN(parsedBuyIn) || parsedBuyIn < 0) return;
    setSaving(true);
    try {
      const updated = await updateSession(session.id, {
        buy_in: parsedBuyIn,
        started_at: new Date(startedAt).toISOString(),
      });
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    parseFloat(buyIn) !== session.buy_in ||
    new Date(startedAt).toISOString() !== session.started_at;

  return (
    <div className="rounded-xl border border-emerald-800 bg-emerald-950 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Session in progress</p>
          <p className="text-xs text-emerald-400">
            {session.location_name} · {session.stakes_label}
          </p>
        </div>
        <Link
          href="/sessions/close"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Close →
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Buy-in ($)</label>
          <input
            type="number"
            min="0"
            step="any"
            value={buyIn}
            onChange={(e) => setBuyIn(e.target.value)}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Start time</label>
          <input
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>
    </div>
  );
}
