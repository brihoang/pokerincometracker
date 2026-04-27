import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { StakesRepository } from "@/lib/repositories/stakes";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return Response.json(await StakesRepository.getAll(userId));
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { label, small_blind, big_blind } = body;

  if (!label?.trim()) {
    return Response.json({ error: "Stakes label is required" }, { status: 400 });
  }

  const all = await StakesRepository.getAll(userId);
  if (all.some((s) => s.label.toLowerCase() === label.trim().toLowerCase())) {
    return Response.json({ error: "A stakes entry with this label already exists" }, { status: 409 });
  }

  const stakes = await StakesRepository.create(userId, { label, small_blind: small_blind ?? null, big_blind: big_blind ?? null });
  return Response.json(stakes, { status: 201 });
}
