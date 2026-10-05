"use client";

import { FieldConfig } from "@/lib/controls";

interface FieldConfigPanelProps {
  field: FieldConfig;
  onChange: (field: FieldConfig) => void;
}

export default function FieldConfigPanel({
  field,
  onChange,
}: FieldConfigPanelProps) {
  function update(partial: Partial<FieldConfig>) {
    onChange({ ...field, ...partial } as FieldConfig);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Konfiguracja pola
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Etykieta
        </label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nazwa parametru
        </label>
        <input
          type="text"
          value={field.paramName}
          onChange={(e) => update({ paramName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={field.required}
          onChange={(e) => update({ required: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="required" className="text-sm text-gray-700">
          Required
        </label>
      </div>

      {field.control === "StringInput" && (
        <>
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              String Input
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stringOnly"
                  checked={field.stringOnly || false}
                  onChange={(e) => update({ stringOnly: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="stringOnly" className="text-sm text-gray-700">
                  String Only
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Number Only
                </label>
                <select
                  value={field.numberOnly || ""}
                  onChange={(e) =>
                    update({
                      numberOnly: (e.target.value || null) as
                        | "Natural"
                        | "Decimal"
                        | "Float"
                        | null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Brak</option>
                  <option value="Natural">Natural</option>
                  <option value="Decimal">Decimal</option>
                  <option value="Float">Float</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Regexp
                </label>
                <select
                  value={field.regexp || ""}
                  onChange={(e) =>
                    update({
                      regexp: (e.target.value || undefined) as
                        | "email"
                        | "IBAN"
                        | "NRB"
                        | "PESEL"
                        | "custom"
                        | undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Brak</option>
                  <option value="email">Email</option>
                  <option value="IBAN">IBAN</option>
                  <option value="NRB">NRB</option>
                  <option value="PESEL">PESEL</option>
                  <option value="custom">Własny</option>
                </select>
              </div>

              {field.regexp === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Własny wzorzec
                  </label>
                  <input
                    type="text"
                    value={field.customPattern || ""}
                    onChange={(e) => update({ customPattern: e.target.value })}
                    placeholder="^[a-z]+$"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {field.control === "DateInput" && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Date Input
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dateOnly"
                checked={field.dateOnly || false}
                onChange={(e) => update({ dateOnly: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="dateOnly" className="text-sm text-gray-700">
                Date Only
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noPastDate"
                checked={field.noPastDate || false}
                onChange={(e) => update({ noPastDate: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="noPastDate" className="text-sm text-gray-700">
                No Past Date
              </label>
            </div>
          </div>
        </div>
      )}

      {field.control === "TextInput" && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Text Input
          </h4>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Max Text Size
            </label>
            <input
              type="number"
              value={field.maxTextSize || ""}
              onChange={(e) =>
                update({
                  maxTextSize: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {field.control === "ListInput" && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            List Input
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBool"
                checked={field.isBool || false}
                onChange={(e) => update({ isBool: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isBool" className="text-sm text-gray-700">
                isBool (radiobutton)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="multipleChoice"
                checked={field.multipleChoice || false}
                onChange={(e) => update({ multipleChoice: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="multipleChoice" className="text-sm text-gray-700">
                Multiple Choice (checkboxes)
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
