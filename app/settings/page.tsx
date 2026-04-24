"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Location, Stakes } from "@/lib/types";
import { getLocations } from "@/lib/client/locations";
import { getStakes } from "@/lib/client/stakes";
import LocationsManager from "@/app/components/LocationsManager";
import StakesManager from "@/app/components/StakesManager";
import AppSettingsManager from "@/app/components/AppSettingsManager";

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
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">← Home</Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Locations</h2>
          <LocationsManager locations={locations} onChange={setLocations} />
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Stakes</h2>
          <StakesManager stakes={stakes} onChange={setStakes} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">App Settings</h2>
          <AppSettingsManager locations={locations} stakes={stakes} />
        </div>
      </div>
    </main>
  );
}
