"use client";

import { useState } from "react";
import { FieldConfig } from "@/lib/controls";
import { buildZodSchema } from "@/lib/validation";
import { generatePayload, ApiPayload } from "@/lib/json-generator";
import StringInput from "./controls/string-input";
import DateInput from "./controls/date-input";
import TextInput from "./controls/text-input";
import ListInput from "./controls/list-input";

interface FormRendererProps {
  fields: FieldConfig[];
  endpoint: string;
  method: string;
}

export default function FormRenderer({
  fields,
  endpoint,
  method,
}: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [copied, setCopied] = useState(false);

  const schema = buildZodSchema(fields);

  function handleChange(paramName: string, value: unknown) {
    setValues((prev) => ({ ...prev, [paramName]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[paramName];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = schema.safeParse(values);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!newErrors[key]) {
          newErrors[key] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    setPayload(generatePayload(fields, values, endpoint, method));
    setCopied(false);
  }

  function handleCopy() {
    if (payload) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => {
          const value = values[field.paramName] ?? "";
          const error = errors[field.paramName];

          switch (field.control) {
            case "StringInput":
              return (
                <StringInput
                  key={field.paramName}
                  config={field}
                  value={value as string}
                  onChange={(v) => handleChange(field.paramName, v)}
                  error={error}
                />
              );
            case "DateInput":
              return (
                <DateInput
                  key={field.paramName}
                  config={field}
                  value={value as string}
                  onChange={(v) => handleChange(field.paramName, v)}
                  error={error}
                />
              );
            case "TextInput":
              return (
                <TextInput
                  key={field.paramName}
                  config={field}
                  value={value as string}
                  onChange={(v) => handleChange(field.paramName, v)}
                  error={error}
                />
              );
            case "ListInput":
              return (
                <ListInput
                  key={field.paramName}
                  config={field}
                  value={value as string | string[]}
                  onChange={(v) => handleChange(field.paramName, v)}
                  error={error}
                />
              );
            default:
              return null;
          }
        })}

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          ZAPISZ / WYŚLIJ
        </button>
      </form>

      {payload && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Wygenerowany JSON</h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              {copied ? "Skopiowano!" : "Kopiuj do schowka"}
            </button>
          </div>
          <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
