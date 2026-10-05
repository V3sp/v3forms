import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const endpoint = await prisma.apiEndpoint.findUnique({
    where: { id: params.id },
    include: {
      params: true,
    },
  });

  if (!endpoint) {
    return NextResponse.json(
      { error: "Nie znaleziono endpointa" },
      { status: 404 }
    );
  }

  return NextResponse.json(endpoint);
}
