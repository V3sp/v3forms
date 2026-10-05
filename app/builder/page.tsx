"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import ControlPalette from "@/components/control-palette";
import FormCanvas from "@/components/form-canvas";
import FieldConfigPanel from "@/components/field-config-panel";
import ApiParamsPanel from "@/components/api-params-panel";
import { FieldConfig, ControlType } from "@/lib/controls";

interface Spec {
  id: string;
  name: string;
  endpoints: { id: string; method: string; path: string }[];
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const specId = searchParams.get("specId");

  const [spec, setSpec] = useState<Spec | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [endpointParams, setEndpointParams] = useState<any[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ControlType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (!specId) return;
    fetch(`/api/specs/${specId}`)
      .then((r) => r.json())
      .then((data) => {
        setSpec(data);
        if (data.endpoints?.length > 0) {
          setSelectedEndpoint(data.endpoints[0].id);
        }
      });
  }, [specId]);

  useEffect(() => {
    if (!selectedEndpoint) {
      setEndpointParams([]);
      return;
    }
    fetch(`/api/endpoints/${selectedEndpoint}`)
      .then((r) => r.json())
      .then((data) => {
        setEndpointParams(data.params || []);
      });
  }, [selectedEndpoint]);

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as ControlType;
    setActiveType(type);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveType(null);
    const { active, over } = event;
    if (!over) return;

    const from = active.data.current?.from;

    if (from === "palette" && over.id === "canvas") {
      const type = active.data.current?.type as ControlType;
      const newField: FieldConfig = {
        control: type,
        label: `Pole ${fields.length + 1}`,
        required: false,
        paramName: `param_${fields.length + 1}`,
      } as FieldConfig;

      setFields([...fields, newField]);
      setSelectedIndex(fields.length);
    } else if (from === "api-params" && over.id === "canvas") {
      const mappedControl = active.data.current?.mappedControl as FieldConfig;
      const newField: FieldConfig = {
        ...mappedControl,
        label: mappedControl.paramName,
      };

      setFields([...fields, newField]);
      setSelectedIndex(fields.length);
    } else if (from === "canvas") {
      const oldIndex = active.data.current?.index as number;
      const newIndex = over.data.current?.index as number;
      if (oldIndex !== newIndex) {
        const newFields = [...fields];
        const [moved] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, moved);
        setFields(newFields);
      }
    }
  }

  function handleSave() {
    if (!formName.trim()) {
      setError("Podaj nazwę formularza");
      return;
    }
    if (!selectedEndpoint) {
      setError("Wybierz endpoint");
      return;
    }
    if (fields.length === 0) {
      setError("Dodaj przynajmniej jedno pole");
      return;
    }

    setSaving(true);
    setError(null);

    fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName,
        endpointId: selectedEndpoint,
        fields,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.formId) {
          router.push(`/form/${data.formId}`);
        } else {
          setError(data.error || "Błąd zapisu");
          setSaving(false);
        }
      })
      .catch(() => {
        setError("Błąd sieci");
        setSaving(false);
      });
  }

  if (!specId) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Form Builder</h1>
        <p className="text-gray-600">
          Najpierw{" "}
          <a href="/import" className="text-blue-600 underline">
            zaimportuj specyfikację OpenAPI
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Form Builder</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nazwa formularza
        </label>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endpoint
        </label>
        <select
          value={selectedEndpoint || ""}
          onChange={(e) => setSelectedEndpoint(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {spec?.endpoints.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {ep.method} {ep.path}
            </option>
          ))}
        </select>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-6">
            <ControlPalette />
            <ApiParamsPanel params={endpointParams} />
          </div>
          <div className="col-span-6">
            <FormCanvas
              fields={fields}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onRemove={(i) => {
                setFields(fields.filter((_, idx) => idx !== i));
                setSelectedIndex(null);
              }}
            />
          </div>
          <div className="col-span-3">
            {selectedIndex !== null && fields[selectedIndex] ? (
              <FieldConfigPanel
                field={fields[selectedIndex]}
                onChange={(updated) => {
                  const newFields = [...fields];
                  newFields[selectedIndex] = updated;
                  setFields(newFields);
                }}
              />
            ) : (
              <p className="text-gray-400 text-sm">
                Wybierz pole na canvasie, aby skonfigurować.
              </p>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeType ? (
            <div className="p-3 bg-white border-2 border-blue-400 rounded-lg shadow-lg">
              {activeType}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {saving ? "Zapisywanie..." : "Zapisz formularz"}
        </button>
      </div>
    </main>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">Ładowanie...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
