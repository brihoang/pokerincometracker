import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { LocationRepository } from "@/lib/repositories/locations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { name } = body;

  if (!name?.trim()) {
    return Response.json({ error: "Location name is required" }, { status: 400 });
  }

  const updated = await LocationRepository.update(userId, id, { name });
  if (!updated) return Response.json({ error: "Location not found" }, { status: 404 });

  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const removed = await LocationRepository.delete(userId, id);
  if (!removed) return Response.json({ error: "Location not found" }, { status: 404 });

  return new Response(null, { status: 204 });
}
