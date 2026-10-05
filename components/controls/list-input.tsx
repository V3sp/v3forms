"use client";

import { ListInputConfig } from "@/lib/controls";

export default function ListInput({
  config,
  value,
  onChange,
  error,
}: {
  config: ListInputConfig;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}) {
  const options = config.isBool
    ? ["true", "false"]
    : ["opcja1", "opcja2", "opcja3"];

  if (config.multipleChoice) {
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {config.label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedValues, opt]);
                  } else {
                    onChange(selectedValues.filter((v) => v !== opt));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="radio"
              name={config.paramName}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
