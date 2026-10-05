import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const form = await prisma.formDefinition.findUnique({
    where: { id: params.id },
    include: {
      endpoint: true,
    },
  });

  if (!form) {
    return NextResponse.json(
      { error: "Nie znaleziono formularza" },
      { status: 404 }
    );
  }

  return NextResponse.json(form);
}
