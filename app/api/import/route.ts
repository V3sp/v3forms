import { NextRequest, NextResponse } from "next/server";
import * as yaml from "js-yaml";
import { parseOpenAPI } from "@/lib/openapi-parser";
import { saveSpec } from "@/lib/import-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    }

    const content = await file.text();
    let spec: any;

    try {
      spec = yaml.load(content);
    } catch {
      return NextResponse.json(
        { error: "Nieprawidłowy format pliku" },
        { status: 400 }
      );
    }

    const parsed = parseOpenAPI(spec);
    const specId = await saveSpec(parsed, "upload", file.name);

    return NextResponse.json({
      specId,
      endpointsCount: parsed.endpoints.length,
      paramsCount: parsed.endpoints.reduce((sum, e) => sum + e.params.length, 0),
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Błąd podczas importu specyfikacji" },
      { status: 500 }
    );
  }
}
