import { prisma } from "./prisma";
import { FieldConfig } from "./controls";

export async function saveForm(
  name: string,
  endpointId: string,
  fields: FieldConfig[]
): Promise<string> {
  const form = await prisma.formDefinition.create({
    data: {
      name,
      endpointId,
      schema: JSON.stringify({ name, endpointId, fields }),
    },
  });

  return form.id;
}
