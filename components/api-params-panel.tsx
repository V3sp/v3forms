"use client";

import { useDraggable } from "@dnd-kit/core";
import { mapParameterToControl } from "@/lib/auto-mapping";
import { FieldConfig } from "@/lib/controls";

interface ApiParameter {
  id: string;
  name: string;
  location: string;
  type: string;
  required: boolean;
  format?: string | null;
  enumValues?: string | null;
  pattern?: string | null;
}

function DraggableParam({
  param,
  mappedControl,
}: {
  param: ApiParameter;
  mappedControl: FieldConfig;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `api-param-${param.id}`,
      data: { param, mappedControl, from: "api-params" },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 1000,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border-2 border-gray-200 rounded-lg cursor-grab hover:border-green-400 hover:shadow-md transition select-none ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{param.name}</p>
          <p className="text-xs text-gray-500">
            {param.type}
            {param.format ? ` (${param.format})` : ""} · {param.location}
          </p>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
          → {mappedControl.control}
        </span>
      </div>
    </div>
  );
}

export default function ApiParamsPanel({
  params,
}: {
  params: ApiParameter[];
}) {
  if (params.length === 0) {
    return (
      <div className="text-sm text-gray-400">Brak parametrów do wyświetlenia.</div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Parametry API
      </h3>
      {params.map((param) => (
        <DraggableParam
          key={param.id}
          param={param}
          mappedControl={mapParameterToControl(param)}
        />
      ))}
    </div>
  );
}
