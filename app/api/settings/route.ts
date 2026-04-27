import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SettingsRepository } from "@/lib/repositories/settings";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return Response.json(SettingsRepository.get());
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { default_location_id, default_stakes_id } = body;
  const updated = SettingsRepository.update({ default_location_id, default_stakes_id });
  return Response.json(updated);
}
