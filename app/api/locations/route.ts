import { LocationRepository } from "@/lib/repositories/locations";

export async function GET() {
  return Response.json(LocationRepository.getAll());
}

export async function POST() {
  return Response.json({});
}
