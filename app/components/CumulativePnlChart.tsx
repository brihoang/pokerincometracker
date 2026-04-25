"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Session, YAxisMode } from "@/lib/types";
import { calcCumulativeProfit } from "@/lib/utils/calculations";

function formatCurrency(value: number): string {
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function calcCumulativeBB(sessions: Session[]): { session: Session; cumulative: number }[] {
  if (sessions.length === 0) return [];
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.ended_at!).getTime() - new Date(b.ended_at!).getTime()
  );
  let running = 0;
  return sorted.map((session) => {
    const bb = session.big_blind;
    running += bb ? (session.profit_loss ?? 0) / bb : 0;
    return { session, cumulative: running };
  });
}

function CustomTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean;
  payload?: { payload: { session: Session; cumulative: number } }[];
  mode: YAxisMode;
}) {
  if (!active || !payload?.length) return null;
  const { session, cumulative } = payload[0].payload;
  const isPositive = cumulative > 0;
  const label = mode === "bb" ? formatBB(cumulative) : formatCurrency(cumulative);
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-lg">
      <p className="text-zinc-400">{session.ended_at ? formatDate(session.ended_at) : "—"}</p>
      <p className={`mt-0.5 font-semibold ${isPositive ? "text-emerald-400" : cumulative < 0 ? "text-red-400" : "text-zinc-400"}`}>
        {label}
      </p>
    </div>
  );
}

interface Props {
  sessions: Session[];
  mode: YAxisMode;
  onModeChange: (m: YAxisMode) => void;
}

export default function CumulativePnlChart({ sessions, mode, onModeChange }: Props) {

  const currencyData = calcCumulativeProfit(sessions);
  const bbData = calcCumulativeBB(sessions);
  const hasBB = sessions.some((s) => s.big_blind != null);

  const data = mode === "bb" ? bbData : currencyData;

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
        <p className="text-sm text-zinc-500">No sessions to chart</p>
      </div>
    );
  }

  const yValues = data.map((d) => d.cumulative);
  const rawMin = Math.min(0, ...yValues);
  const rawMax = Math.max(0, ...yValues);

  function niceScale(min: number, max: number, targetTicks = 5) {
    const range = max - min;
    if (range === 0) {
      const step = Math.abs(min) > 0 ? Math.pow(10, Math.floor(Math.log10(Math.abs(min)))) : 1;
      return { domain: [min - step, max + step] as [number, number], ticks: [min] };
    }
    const rawStep = range / (targetTicks - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    const niceStep = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    const step = niceStep * magnitude;
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let t = niceMin; t <= niceMax + step * 0.001; t += step) {
      ticks.push(Math.round(t * 1e6) / 1e6);
    }
    return { domain: [niceMin, niceMax] as [number, number], ticks };
  }

  const { domain: yDomain, ticks: yTicks } = niceScale(rawMin, rawMax);

  const yTickFormatter =
    mode === "bb"
      ? (v: number) => `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}bb`
      : (v: number) => `$${v}`;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {hasBB && (
        <div className="mb-3 flex justify-end">
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-800 p-0.5 text-xs">
            <button
              onClick={() => onModeChange("currency")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                mode === "currency" ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              $
            </button>
            <button
              onClick={() => onModeChange("bb")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                mode === "bb" ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              BB
            </button>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis hide />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={yTickFormatter}
            tick={{ fill: "#71717a", fontSize: 11 }}
            width={mode === "bb" ? 44 : 50}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="#52525b" strokeDasharray="4 3" />
          <Tooltip content={<CustomTooltip mode={mode} />} cursor={{ stroke: "#52525b", strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#34d399"
            strokeWidth={2}
            dot={data.length === 1 ? { r: 4, fill: "#34d399", stroke: "#18181b", strokeWidth: 2 } : false}
            activeDot={{ r: 4, fill: "#34d399", stroke: "#18181b", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
