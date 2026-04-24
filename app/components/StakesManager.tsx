"use client";

import { useState } from "react";
import { Stakes } from "@/lib/types";
import { createStakes, updateStakes, deleteStakes, buildStakesLabel } from "@/lib/client/stakes";

function StakesForm({
  initialSb,
  initialBb,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initialSb?: string;
  initialBb?: string;
  onSubmit: (sb: number, bb: number) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [sb, setSb] = useState(initialSb ?? "");
  const [bb, setBb] = useState(initialBb ?? "");
  const [submitting, setSubmitting] = useState(false);

  const sbNum = parseFloat(sb);
  const bbNum = parseFloat(bb);
  const isValid = sb !== "" && bb !== "" && !isNaN(sbNum) && !isNaN(bbNum) && sbNum > 0 && bbNum > 0;
  const preview = isValid ? buildStakesLabel(sbNum, bbNum) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(sbNum, bbNum);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label className="text-xs text-zinc-400">Small Blind ($)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="1"
            value={sb}
            onChange={(e) => setSb(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white placeholder-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label className="text-xs text-zinc-400">Big Blind ($)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="2"
            value={bb}
            onChange={(e) => setBb(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white placeholder-zinc-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      {preview && (
        <p className="text-xs text-zinc-400">
          Label: <span className="font-medium text-white">{preview}</span>
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="h-9 flex-1 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="h-9 px-3 text-sm text-zinc-400 hover:text-white">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

interface Props {
  stakes: Stakes[];
  onChange: (stakes: Stakes[]) => void;
}

export default function StakesManager({ stakes, onChange }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(sb: number, bb: number) {
    setError(null);
    try {
      const entry = await createStakes({ small_blind: sb, big_blind: bb });
      onChange([...stakes, entry]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stakes");
    }
  }

  async function handleEdit(id: string, sb: number, bb: number) {
    setError(null);
    try {
      const updated = await updateStakes(id, { small_blind: sb, big_blind: bb });
      onChange(stakes.map((s) => (s.id === id ? updated : s)));
      setEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stakes");
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete "${label}"? Sessions using this stakes level will not be affected.`)) return;
    await deleteStakes(id);
    onChange(stakes.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-zinc-300">Add Stakes</p>
        <StakesForm submitLabel="Add" onSubmit={handleAdd} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {stakes.length === 0 ? (
        <p className="text-sm text-zinc-500">No stakes yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {stakes.map((s) => (
            <li key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              {editId === s.id ? (
                <StakesForm
                  initialSb={s.small_blind?.toString() ?? ""}
                  initialBb={s.big_blind?.toString() ?? ""}
                  submitLabel="Save"
                  onSubmit={(sb, bb) => handleEdit(s.id, sb, bb)}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium text-white">{s.label}</span>
                  {s.small_blind !== null && (
                    <span className="text-xs text-zinc-500">${s.small_blind}/${s.big_blind}</span>
                  )}
                  <button onClick={() => setEditId(s.id)} className="text-sm text-zinc-400 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(s.id, s.label)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
