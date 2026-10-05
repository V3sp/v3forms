import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">OpenAPI Form Builder</h1>
      <p className="text-gray-600 text-center max-w-md">
        Importuj specyfikację OpenAPI, buduj formularze drag&drop i generuj JSON.
      </p>
      <nav className="flex gap-4">
        <Link
          href="/import"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Import OpenAPI
        </Link>
        <Link
          href="/builder"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Builder
        </Link>
      </nav>
    </main>
  );
}
