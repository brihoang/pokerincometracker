import { SessionRepository } from "@/lib/repositories/sessions";

export async function GET(_req: Request, ctx: RouteContext<"/api/sessions/[id]">) {
  const { id } = await ctx.params;
  const session = SessionRepository.getById(id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  return Response.json(session);
}

export async function PUT(req: Request, ctx: RouteContext<"/api/sessions/[id]">) {
  const { id } = await ctx.params;
  const existing = SessionRepository.getById(id);
  if (!existing) return Response.json({ error: "Session not found" }, { status: 404 });
  const body = await req.json();
  const updated = SessionRepository.update(id, body);
  return Response.json(updated);
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/sessions/[id]">) {
  const { id } = await ctx.params;
  const deleted = SessionRepository.delete(id);
  if (!deleted) return Response.json({ error: "Session not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
