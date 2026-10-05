"use client";

import { TextInputConfig } from "@/lib/controls";

export default function TextInput({
  config,
  value,
  onChange,
  error,
}: {
  config: TextInputConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={config.maxTextSize}
        rows={4}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {config.maxTextSize && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length}/{config.maxTextSize}
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
