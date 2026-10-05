import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const spec = await prisma.apiSpec.findUnique({
    where: { id: params.id },
    include: {
      endpoints: {
        include: {
          params: true,
        },
      },
    },
  });

  if (!spec) {
    return NextResponse.json({ error: "Nie znaleziono specyfikacji" }, { status: 404 });
  }

  return NextResponse.json(spec);
}
