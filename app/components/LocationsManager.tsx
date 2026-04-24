"use client";

import { useEffect, useState } from "react";
import { Location } from "@/lib/types";
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/lib/client/locations";

export default function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const location = await createLocation(newName.trim());
      setLocations((prev) => [...prev, location].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add location");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editName.trim() || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const updated = await updateLocation(id, editName.trim());
      setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update location");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Sessions using this location will not be affected.`)) return;
    await deleteLocation(id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New location name"
          className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={!newName.trim() || submitting}
          className="h-10 rounded-lg bg-emerald-600 px-4 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {locations.length === 0 ? (
        <p className="text-sm text-zinc-500">No locations yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {locations.map((l) => (
            <li key={l.id} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
              {editId === l.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 text-sm text-white"
                    autoFocus
                  />
                  <button onClick={() => handleEdit(l.id)} className="text-sm text-emerald-400 hover:text-emerald-300">Save</button>
                  <button onClick={() => setEditId(null)} className="text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-white">{l.name}</span>
                  <button onClick={() => { setEditId(l.id); setEditName(l.name); }} className="text-sm text-zinc-400 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(l.id, l.name)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
