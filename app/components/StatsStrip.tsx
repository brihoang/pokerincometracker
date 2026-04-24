import { Session, YAxisMode } from "@/lib/types";

function formatPnl(value: number): string {
  if (value > 0) return `+$${value.toFixed(2)}`;
  if (value < 0) return `-$${Math.abs(value).toFixed(2)}`;
  return "$0.00";
}

function formatBB(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1);
  if (value > 0) return `+${formatted} BB`;
  if (value < 0) return `-${formatted} BB`;
  return "0 BB";
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
  mode?: YAxisMode;
}

export default function StatsStrip({ sessions, mode = "currency" }: Props) {
  const count = sessions.length;
  const totalPnl = sessions.reduce((sum, s) => sum + (s.profit_loss ?? 0), 0);
  const totalMins = sessions.reduce((sum, s) => sum + (s.duration_mins ?? 0), 0);
  const avgPnl = count > 0 ? totalPnl / count : 0;

  const totalBB = sessions.reduce((sum, s) => {
    return sum + (s.big_blind ? (s.profit_loss ?? 0) / s.big_blind : 0);
  }, 0);
  const avgBB = count > 0 ? totalBB / count : 0;

  const isBB = mode === "bb";
  const pnlValue = isBB ? totalBB : totalPnl;
  const avgValue = isBB ? avgBB : avgPnl;
  const formatValue = isBB ? formatBB : formatPnl;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3">
      <StatTile label="Sessions" value={String(count)} />
      <StatTile
        label="Total Profit/Loss"
        value={count > 0 ? formatValue(pnlValue) : isBB ? "0 BB" : "$0.00"}
        valueClass={count > 0 ? pnlColor(pnlValue) : "text-white"}
      />
      <StatTile label="Hours Played" value={totalMins > 0 ? formatHours(totalMins) : "0m"} />
      <StatTile
        label="Avg Session"
        value={count > 0 ? formatValue(avgValue) : isBB ? "0 BB" : "$0.00"}
        valueClass={count > 0 ? pnlColor(avgValue) : "text-white"}
      />
    </div>
  );
}
