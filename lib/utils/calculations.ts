import { Session } from "@/lib/types";

export function calcProfitLoss(buyIn: number, cashOut: number): number {
  return cashOut - buyIn;
}

export function calcDurationMins(startedAt: Date, endedAt: Date): number {
  const mins = Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000);
  return Math.max(0, mins);
}

export function calcCumulativeProfit(
  sessions: Session[]
): { session: Session; cumulative: number }[] {
  if (sessions.length === 0) return [];

  const sorted = [...sessions].sort(
    (a, b) => new Date(a.ended_at!).getTime() - new Date(b.ended_at!).getTime()
  );

  let running = 0;
  return sorted.map((session) => {
    running += session.profit_loss ?? 0;
    return { session, cumulative: running };
  });
}
