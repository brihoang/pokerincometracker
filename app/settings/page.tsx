import LocationsManager from "@/app/components/LocationsManager";
import StakesManager from "@/app/components/StakesManager";
import AppSettingsManager from "@/app/components/AppSettingsManager";

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300">← Home</a>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Locations</h2>
          <LocationsManager />
        </div>

        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Stakes</h2>
          <StakesManager />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">App Settings</h2>
          <AppSettingsManager />
        </div>
      </div>
    </main>
  );
}
