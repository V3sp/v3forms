"use client";

import { DateInputConfig } from "@/lib/controls";

export default function DateInput({
  config,
  value,
  onChange,
  error,
}: {
  config: DateInputConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="date"
        value={value}
        min={config.noPastDate ? today : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
