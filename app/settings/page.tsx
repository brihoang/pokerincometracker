"use client";

import { useEffect, useState } from "react";
import { Location, Stakes } from "@/lib/types";
import { getLocations } from "@/lib/client/locations";
import { getStakes } from "@/lib/client/stakes";
import LocationsManager from "@/app/components/LocationsManager";
import StakesManager from "@/app/components/StakesManager";
import AppSettingsManager from "@/app/components/AppSettingsManager";
import DataManager from "@/app/components/DataManager";

export default function SettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stakes, setStakes] = useState<Stakes[]>([]);

  useEffect(() => {
    Promise.all([getLocations(), getStakes()]).then(([locs, stks]) => {
      setLocations(locs);
      setStakes(stks);
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 pb-12 pt-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-white">Settings</h1>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Locations</h2>
          <LocationsManager locations={locations} onChange={setLocations} />
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Stakes</h2>
          <StakesManager stakes={stakes} onChange={setStakes} />
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">App Settings</h2>
          <AppSettingsManager locations={locations} stakes={stakes} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Data</h2>
          <DataManager />
        </div>
      </div>
    </main>
  );
}
