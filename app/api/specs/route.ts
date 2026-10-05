import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const specs = await prisma.apiSpec.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      endpoints: {
        select: { id: true, method: true, path: true },
      },
    },
  });

  return NextResponse.json(specs);
}
