"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { hasLocalData, getLocalPayload, clearLocalData } from "@/lib/client/dataManager";

type State =
  | { stage: "hidden" }
  | { stage: "checking" }
  | { stage: "prompt"; hasDbData: boolean }
  | { stage: "importing" }
  | { stage: "done" };

export default function MigrationBanner() {
  const { isSignedIn } = useAuth();
  const prevRef = useRef<boolean | undefined>(undefined);
  const [state, setState] = useState<State>({ stage: "hidden" });

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = isSignedIn;

    // Only trigger on transition to signed-in
    if (isSignedIn !== true || prev === true) return;
    if (!hasLocalData()) return;

    setState({ stage: "checking" });
    fetch("/api/data/status")
      .then((r) => r.json())
      .then(({ hasData }: { hasData: boolean }) => setState({ stage: "prompt", hasDbData: hasData }))
      .catch(() => setState({ stage: "hidden" }));
  }, [isSignedIn]);

  async function handleImport() {
    setState({ stage: "importing" });
    try {
      const payload = getLocalPayload();
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      clearLocalData();
      setState({ stage: "done" });
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setState({ stage: "hidden" });
    }
  }

  function handleDismiss() {
    clearLocalData();
    setState({ stage: "hidden" });
  }

  if (state.stage === "hidden" || state.stage === "checking") return null;

  const hasDbData = state.stage === "prompt" && state.hasDbData;

  if (state.stage === "done") {
    return (
      <div className="border-b border-emerald-800 bg-emerald-950 px-4 py-3 text-center text-sm text-emerald-400">
        Data imported successfully. Reloading…
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <h3 className="mb-2 text-base font-semibold text-white">Import local data?</h3>

        {state.stage === "prompt" && !hasDbData ? (
          <p className="mb-5 text-sm text-zinc-400">
            You have data saved locally on this device. Import it into your account so it syncs across devices?
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-zinc-400">
              You have data saved locally on this device. Your account already has data.
            </p>
            <p className="mb-5 rounded-lg border border-amber-800 bg-amber-950/50 px-3 py-2.5 text-xs text-amber-400">
              Importing will <strong>replace all existing account data</strong> with your local data. This cannot be undone.
            </p>
          </>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleImport}
            disabled={state.stage === "importing"}
            className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {state.stage === "importing" ? "Importing…" : "Import Local Data"}
          </button>
          <button
            onClick={handleDismiss}
            className="w-full rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white"
          >
            {hasDbData ? "Keep Account Data, Discard Local" : "Discard Local Data"}
          </button>
        </div>
      </div>
    </>
  );
}
