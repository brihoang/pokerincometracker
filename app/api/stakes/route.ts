import { StakesRepository } from "@/lib/repositories/stakes";

export async function GET() {
  return Response.json(StakesRepository.getAll());
}

export async function POST() {
  return Response.json({});
}
