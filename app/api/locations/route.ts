import { NextRequest } from "next/server";
import { LocationRepository } from "@/lib/repositories/locations";

export async function GET() {
  return Response.json(LocationRepository.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body;

  if (!name?.trim()) {
    return Response.json({ error: "Location name is required" }, { status: 400 });
  }

  const all = LocationRepository.getAll();
  if (all.some((l) => l.name.toLowerCase() === name.trim().toLowerCase())) {
    return Response.json({ error: "A location with this name already exists" }, { status: 409 });
  }

  const location = LocationRepository.create({ name });
  return Response.json(location, { status: 201 });
}
