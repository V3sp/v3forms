"use client";

import { useDraggable } from "@dnd-kit/core";
import { ControlType } from "@/lib/controls";

const controls: { type: ControlType; label: string; icon: string }[] = [
  { type: "StringInput", label: "String Input", icon: "Aa" },
  { type: "DateInput", label: "Date Input", icon: "📅" },
  { type: "TextInput", label: "Text Input", icon: "📝" },
  { type: "ListInput", label: "List Input", icon: "☰" },
];

function DraggableControl({
  type,
  label,
  icon,
}: {
  type: ControlType;
  label: string;
  icon: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${type}`,
      data: { type, from: "palette" },
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
      className={`p-3 bg-white border-2 border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md transition select-none ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

export default function ControlPalette() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        Kontrolki
      </h3>
      {controls.map((c) => (
        <DraggableControl key={c.type} {...c} />
      ))}
    </div>
  );
}
