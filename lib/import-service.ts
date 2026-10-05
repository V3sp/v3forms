import { prisma } from "./prisma";
import { ParsedSpec } from "./openapi-parser";

export async function saveSpec(
  parsed: ParsedSpec,
  source: "upload" | "url",
  name: string
): Promise<string> {
  const spec = await prisma.$transaction(async (tx) => {
    const apiSpec = await tx.apiSpec.create({
      data: {
        name,
        source,
        version: parsed.version,
      },
    });

    for (const endpoint of parsed.endpoints) {
      const createdEndpoint = await tx.apiEndpoint.create({
        data: {
          specId: apiSpec.id,
          method: endpoint.method,
          path: endpoint.path,
        },
      });

      for (const param of endpoint.params) {
        await tx.apiParameter.create({
          data: {
            endpointId: createdEndpoint.id,
            name: param.name,
            location: param.location,
            type: param.type,
            required: param.required,
            format: param.format,
            enumValues: param.enumValues ? JSON.stringify(param.enumValues) : null,
            description: param.description,
            pattern: param.pattern,
            minLength: param.minLength,
            maxLength: param.maxLength,
            minimum: param.minimum,
            maximum: param.maximum,
            exclusiveMinimum: param.exclusiveMinimum,
            exclusiveMaximum: param.exclusiveMaximum,
          },
        });
      }
    }

    return apiSpec;
  });

  return spec.id;
}
