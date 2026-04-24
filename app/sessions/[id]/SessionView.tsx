"use client";

import { useState } from "react";
import Link from "next/link";
import { Session } from "@/lib/types";
import { deleteSession } from "@/lib/client/sessions";
import {
  formatDatetime,
  formatDuration,
  formatPnl,
  RATING_LABEL,
  RATING_COLOR,
} from "./utils";

function DetailRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-3 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-sm font-medium ${valueClass ?? "text-white"}`}>{value}</span>
    </div>
  );
}

interface Props {
  session: Session;
  onEdit: () => void;
  onDeleted: () => void;
}

export default function SessionView({ session, onEdit, onDeleted }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSession(session.id);
      onDeleted();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const pnl = formatPnl(session.profit_loss);

  const plPerHour = session.duration_mins
    ? formatPnl((session.profit_loss ?? 0) / (session.duration_mins / 60))
    : { text: "—", className: "text-zinc-400" };

  const bbPerHour: { text: string; className: string } = (() => {
    if (!session.big_blind || !session.duration_mins)
      return { text: "—", className: "text-zinc-400" };
    const val = ((session.profit_loss ?? 0) / session.big_blind) / (session.duration_mins / 60);
    const rounded = Math.round(val * 10) / 10;
    if (val > 0) return { text: `+${rounded} BB/hr`, className: "text-emerald-400" };
    if (val < 0) return { text: `${rounded} BB/hr`, className: "text-red-400" };
    return { text: "0 BB/hr", className: "text-zinc-400" };
  })();

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/sessions" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← History
          </Link>
          <button
            onClick={onEdit}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Edit
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4">
          <DetailRow label="Date" value={session.ended_at ? formatDatetime(session.ended_at) : "—"} />
          <DetailRow label="Location" value={session.location_name} />
          <DetailRow label="Stakes" value={session.stakes_label} />
          <DetailRow label="Buy-in" value={`$${session.buy_in.toFixed(2)}`} />
          <DetailRow
            label="Cash-out"
            value={session.cash_out != null ? `$${session.cash_out.toFixed(2)}` : "—"}
          />
          <DetailRow label="Profit/Loss" value={pnl.text} valueClass={pnl.className} />
          <DetailRow label="Profit/Loss per Hour" value={plPerHour.text} valueClass={plPerHour.className} />
          <DetailRow label="BB/hr" value={bbPerHour.text} valueClass={bbPerHour.className} />
          <DetailRow label="Duration" value={formatDuration(session.duration_mins)} />
          <DetailRow label="Started" value={formatDatetime(session.started_at)} />
          {session.rating && (
            <DetailRow
              label="Rating"
              value={RATING_LABEL[session.rating]}
              valueClass={RATING_COLOR[session.rating]}
            />
          )}
          {session.notes && (
            <div className="border-b border-zinc-800 py-3 last:border-0">
              <p className="mb-1 text-sm text-zinc-400">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-white">{session.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          {confirmDelete ? (
            <div className="rounded-xl border border-red-800 bg-red-950 px-4 py-4">
              <p className="mb-4 text-sm text-red-300">Delete this session? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full rounded-xl border border-zinc-800 py-3 text-sm font-medium text-red-400 transition-colors hover:border-red-800 hover:bg-red-950"
            >
              Delete Session
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
