"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      setError("Wybierz plik");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd importu");
        setLoading(false);
        return;
      }

      router.push(`/builder?specId=${data.specId}`);
    } catch {
      setError("Błąd sieci");
      setLoading(false);
    }
  }

  async function handleUrl(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const url = formData.get("url") as string;

    if (!url) {
      setError("Podaj URL");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd importu");
        setLoading(false);
        return;
      }

      router.push(`/builder?specId=${data.specId}`);
    } catch {
      setError("Błąd sieci");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("upload")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "upload"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Wgraj plik
        </button>
        <button
          onClick={() => setTab("url")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === "url"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Podaj URL
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {tab === "upload" ? (
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plik OpenAPI (JSON/YAML)
            </label>
            <input
              type="file"
              name="file"
              accept=".json,.yaml,.yml"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Importowanie..." : "Importuj"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUrl} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL specyfikacji OpenAPI
            </label>
            <input
              type="url"
              name="url"
              placeholder="https://api.example.com/swagger.json"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Importowanie..." : "Importuj"}
          </button>
        </form>
      )}
    </div>
  );
}
