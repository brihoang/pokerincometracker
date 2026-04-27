import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { StakesRepository } from "@/lib/repositories/stakes";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { label, small_blind, big_blind } = body;

  if (!label?.trim()) {
    return Response.json({ error: "Stakes label is required" }, { status: 400 });
  }

  const updated = StakesRepository.update(id, { label, small_blind: small_blind ?? null, big_blind: big_blind ?? null });
  if (!updated) return Response.json({ error: "Stakes entry not found" }, { status: 404 });

  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const removed = StakesRepository.delete(id);
  if (!removed) return Response.json({ error: "Stakes entry not found" }, { status: 404 });

  return new Response(null, { status: 204 });
}
