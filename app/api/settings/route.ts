import { NextRequest } from "next/server";
import { SettingsRepository } from "@/lib/repositories/settings";

export async function GET() {
  return Response.json(SettingsRepository.get());
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { default_location_id, default_stakes_id } = body;
  const updated = SettingsRepository.update({ default_location_id, default_stakes_id });
  return Response.json(updated);
}
