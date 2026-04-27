import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { LocationRepository } from "@/lib/repositories/locations";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return Response.json(await LocationRepository.getAll(userId));
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { name } = body;

  if (!name?.trim()) {
    return Response.json({ error: "Location name is required" }, { status: 400 });
  }

  const all = await LocationRepository.getAll(userId);
  if (all.some((l) => l.name.toLowerCase() === name.trim().toLowerCase())) {
    return Response.json({ error: "A location with this name already exists" }, { status: 409 });
  }

  const location = await LocationRepository.create(userId, { name });
  return Response.json(location, { status: 201 });
}
