export type Rating = "good" | "neutral" | "bad";

export const RATINGS: { value: Rating; label: string }[] = [
  { value: "good", label: "Good" },
  { value: "neutral", label: "Neutral" },
  { value: "bad", label: "Bad" },
];

export const RATING_LABEL: Record<string, string> = {
  good: "Good",
  neutral: "Neutral",
  bad: "Bad",
};

export const RATING_COLOR: Record<string, string> = {
  good: "text-emerald-400",
  neutral: "text-zinc-400",
  bad: "text-red-400",
};

export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(mins: number | null): string {
  if (mins === null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatPnl(pl: number | null): { text: string; className: string } {
  if (pl === null) return { text: "—", className: "text-zinc-400" };
  if (pl > 0) return { text: `+$${pl.toFixed(2)}`, className: "text-emerald-400" };
  if (pl < 0) return { text: `-$${Math.abs(pl).toFixed(2)}`, className: "text-red-400" };
  return { text: "$0.00", className: "text-zinc-400" };
}
