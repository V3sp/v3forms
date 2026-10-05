import { prisma } from "@/lib/prisma";
import FormRenderer from "@/components/form-renderer";
import { FieldConfig } from "@/lib/controls";

export default async function FormPage({
  params,
}: {
  params: { id: string };
}) {
  const form = await prisma.formDefinition.findUnique({
    where: { id: params.id },
    include: {
      endpoint: true,
    },
  });

  if (!form) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">Nie znaleziono formularza</h1>
      </main>
    );
  }

  const schema = JSON.parse(form.schema);
  const fields = schema.fields as FieldConfig[];

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-2">{form.name}</h1>
      <p className="text-gray-600 mb-6">
        {form.endpoint.method} {form.endpoint.path}
      </p>
      <FormRenderer
        fields={fields}
        endpoint={form.endpoint.path}
        method={form.endpoint.method}
      />
    </main>
  );
}
