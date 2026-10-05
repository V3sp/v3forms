import { NextRequest, NextResponse } from "next/server";
import * as yaml from "js-yaml";
import { parseOpenAPI } from "@/lib/openapi-parser";
import { saveSpec } from "@/lib/import-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Brak URL" }, { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Nie udało się pobrać specyfikacji: ${response.status}` },
        { status: 400 }
      );
    }

    const content = await response.text();
    let spec: any;

    try {
      spec = yaml.load(content);
    } catch {
      return NextResponse.json(
        { error: "Nieprawidłowy format specyfikacji" },
        { status: 400 }
      );
    }

    const parsed = parseOpenAPI(spec);
    const specId = await saveSpec(parsed, "url", url);

    return NextResponse.json({
      specId,
      endpointsCount: parsed.endpoints.length,
      paramsCount: parsed.endpoints.reduce((sum, e) => sum + e.params.length, 0),
    });
  } catch (error) {
    console.error("Import URL error:", error);
    return NextResponse.json(
      { error: "Błąd podczas importu specyfikacji" },
      { status: 500 }
    );
  }
}
