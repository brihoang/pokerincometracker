import { NextRequest } from "next/server";
import { SessionRepository } from "@/lib/repositories/sessions";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");

  if (status === "open") {
    const open = SessionRepository.getOpen();
    return Response.json(open ? [open] : []);
  }

  return Response.json(SessionRepository.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { location_id, location_name, stakes_id, stakes_label, big_blind, buy_in, started_at } = body;

  if (!location_id || !location_name || !stakes_id || !stakes_label || buy_in == null || !started_at) {
    return Response.json(
      { error: "Missing required fields: location_id, location_name, stakes_id, stakes_label, buy_in, started_at" },
      { status: 400 }
    );
  }

  const session = SessionRepository.create({
    location_id,
    location_name,
    stakes_id,
    stakes_label,
    big_blind: big_blind ?? null,
    buy_in,
    started_at,
    game_type: "NLH",
  });

  return Response.json(session, { status: 201 });
}
