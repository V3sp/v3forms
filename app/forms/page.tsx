import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FormsPage() {
  const forms = await prisma.formDefinition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      endpoint: true,
    },
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Zapisane formularze</h1>

      {forms.length === 0 ? (
        <p className="text-gray-600">
          Brak zapisanych formularzy.{" "}
          <Link href="/builder" className="text-blue-600 underline">
            Przejdź do buildera
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <Link
              key={form.id}
              href={`/form/${form.id}`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{form.name}</h3>
                  <p className="text-sm text-gray-500">
                    {form.endpoint.method} {form.endpoint.path}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {form.createdAt.toLocaleDateString("pl-PL")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
