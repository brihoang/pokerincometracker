"use client";

import { useRef, useState } from "react";
import { exportData, importData } from "@/lib/client/dataManager";

type ImportState =
  | { stage: "idle" }
  | { stage: "confirm"; payload: unknown; fileName: string }
  | { stage: "success"; counts: { sessions: number; locations: number; stakes: number } }
  | { stage: "error"; message: string };

export default function DataManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importState, setImportState] = useState<ImportState>({ stage: "idle" });
  const [importing, setImporting] = useState(false);

  function handleExport() {
    exportData();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target?.result as string);
        setImportState({ stage: "confirm", payload, fileName: file.name });
      } catch {
        setImportState({ stage: "error", message: "Could not parse file — make sure it's a valid JSON export." });
      }
    };
    reader.readAsText(file);
  }

  function handleConfirm() {
    if (importState.stage !== "confirm") return;
    setImporting(true);
    try {
      const result = importData(importState.payload);
      setImportState({ stage: "success", counts: result.imported });
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setImportState({ stage: "error", message: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setImporting(false);
    }
  }

  function handleCancel() {
    setImportState({ stage: "idle" });
  }

  return (
    <div className="space-y-3">
      {/* Export */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Export Data</p>
          <p className="text-xs text-zinc-500">Download all sessions, locations, and stakes as JSON</p>
        </div>
        <button
          onClick={handleExport}
          className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
        >
          {exportSuccess ? "Downloaded ✓" : "Export"}
        </button>
      </div>

      {/* Import */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Import Data</p>
          <p className="text-xs text-zinc-500">Replace all data from a previously exported file</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Import status messages */}
      {importState.stage === "error" && (
        <p className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
          {importState.message}
          <button onClick={() => setImportState({ stage: "idle" })} className="ml-2 underline">
            Dismiss
          </button>
        </p>
      )}
      {importState.stage === "success" && (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-400">
          Imported {importState.counts.sessions} session{importState.counts.sessions !== 1 ? "s" : ""},{" "}
          {importState.counts.locations} location{importState.counts.locations !== 1 ? "s" : ""},{" "}
          {importState.counts.stakes} stakes. Reloading…
        </p>
      )}

      {/* Confirmation dialog */}
      {importState.stage === "confirm" && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={handleCancel} />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-white">Replace all data?</h3>
            <p className="mb-5 text-sm text-zinc-400">
              Importing will permanently replace all your existing sessions, locations, and stakes. This cannot be
              undone. Continue?
            </p>
            <p className="mb-5 truncate text-xs text-zinc-600">{importState.fileName}</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={importing}
                className="flex-1 rounded-lg bg-red-700 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {importing ? "Importing…" : "Replace All Data"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
