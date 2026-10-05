import { NextRequest, NextResponse } from "next/server";
import { saveForm } from "@/lib/form-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, endpointId, fields } = body;

    if (!name || !endpointId || !fields) {
      return NextResponse.json(
        { error: "Brakujące pola: name, endpointId, fields" },
        { status: 400 }
      );
    }

    const formId = await saveForm(name, endpointId, fields);

    return NextResponse.json({ formId });
  } catch (error) {
    console.error("Save form error:", error);
    return NextResponse.json(
      { error: "Błąd podczas zapisu formularza" },
      { status: 500 }
    );
  }
}
