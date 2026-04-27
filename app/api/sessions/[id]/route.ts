import { auth } from "@clerk/nextjs/server";
import { SessionRepository } from "@/lib/repositories/sessions";
import { calcProfitLoss, calcDurationMins } from "@/lib/utils/calculations";

export async function GET(_req: Request, ctx: RouteContext<"/api/sessions/[id]">) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const session = await SessionRepository.getById(userId, id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  return Response.json(session);
}

export async function PUT(req: Request, ctx: RouteContext<"/api/sessions/[id]">) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const existing = await SessionRepository.getById(userId, id);
  if (!existing) return Response.json({ error: "Session not found" }, { status: 404 });
  const body = await req.json();
  const patch = { ...body };

  if (patch.status === "closed" && patch.cash_out != null) {
    const startedAt = patch.started_at ?? existing.started_at;
    const endedAt = patch.ended_at ?? new Date().toISOString();
    patch.profit_loss = calcProfitLoss(existing.buy_in, patch.cash_out);
    patch.duration_mins = calcDurationMins(new Date(startedAt), new Date(endedAt));
  }

  const updated = await SessionRepository.update(userId, id, patch);
  return Response.json(updated);
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/sessions/[id]">) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const deleted = await SessionRepository.delete(userId, id);
  if (!deleted) return Response.json({ error: "Session not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
