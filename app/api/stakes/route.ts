import { NextRequest } from "next/server";
import { StakesRepository } from "@/lib/repositories/stakes";

export async function GET() {
  return Response.json(StakesRepository.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { label, small_blind, big_blind } = body;

  if (!label?.trim()) {
    return Response.json({ error: "Stakes label is required" }, { status: 400 });
  }

  const all = StakesRepository.getAll();
  if (all.some((s) => s.label.toLowerCase() === label.trim().toLowerCase())) {
    return Response.json({ error: "A stakes entry with this label already exists" }, { status: 409 });
  }

  const stakes = StakesRepository.create({ label, small_blind: small_blind ?? null, big_blind: big_blind ?? null });
  return Response.json(stakes, { status: 201 });
}
