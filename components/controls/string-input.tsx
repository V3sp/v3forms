"use client";

import { StringInputConfig } from "@/lib/controls";

const REGEXPS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
  NRB: /^\d{2}\d{4}\d{4}\d{4}\d{4}\d{4}\d{4}$/,
  PESEL: /^\d{11}$/,
};

export default function StringInput({
  config,
  value,
  onChange,
  error,
}: {
  config: StringInputConfig;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const pattern =
    config.regexp === "custom" && config.customPattern
      ? new RegExp(config.customPattern)
      : config.regexp && REGEXPS[config.regexp]
        ? REGEXPS[config.regexp]
        : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
