import { Session } from "@/lib/types";

function formatPnl(value: number): string {
  if (value > 0) return `+$${value.toFixed(2)}`;
  if (value < 0) return `-$${Math.abs(value).toFixed(2)}`;
  return "$0.00";
}

function formatHours(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function pnlColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-white";
}

interface StatTileProps {
  label: string;
  value: string;
  valueClass?: string;
}

function StatTile({ label, value, valueClass }: StatTileProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`text-lg font-semibold ${valueClass ?? "text-white"}`}>{value}</p>
    </div>
  );
}

interface Props {
  sessions: Session[];
}

export default function StatsStrip({ sessions }: Props) {
  const count = sessions.length;
  const totalPnl = sessions.reduce((sum, s) => sum + (s.profit_loss ?? 0), 0);
  const totalMins = sessions.reduce((sum, s) => sum + (s.duration_mins ?? 0), 0);
  const avgPnl = count > 0 ? totalPnl / count : 0;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3">
      <StatTile label="Sessions" value={String(count)} />
      <StatTile label="Total Profit/Loss" value={count > 0 ? formatPnl(totalPnl) : "$0.00"} valueClass={count > 0 ? pnlColor(totalPnl) : "text-white"} />
      <StatTile label="Hours Played" value={totalMins > 0 ? formatHours(totalMins) : "0m"} />
      <StatTile label="Avg Session" value={count > 0 ? formatPnl(avgPnl) : "$0.00"} valueClass={count > 0 ? pnlColor(avgPnl) : "text-white"} />
    </div>
  );
}
