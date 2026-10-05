"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldConfig } from "@/lib/controls";

interface FormCanvasProps {
  fields: FieldConfig[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
}

function SortableField({
  field,
  index,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: FieldConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `field-${index}`, data: { index, from: "canvas" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border-2 rounded-lg mb-2 ${
        isSelected ? "border-blue-500 shadow-md" : "border-gray-200"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600"
          >
            ⋮⋮
          </button>
          <span className="font-medium">{field.label}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {field.control}
          </span>
          {field.required && (
            <span className="text-xs text-red-500 font-medium">*required</span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onSelect}
            className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            Konfiguruj
          </button>
          <button
            onClick={onRemove}
            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormCanvas({
  fields,
  selectedIndex,
  onSelect,
  onRemove,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: { from: "canvas" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition ${
        isOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
      }`}
    >
      {fields.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Przeciągnij kontrolki tutaj
        </p>
      ) : (
        <SortableContext
          items={fields.map((_, i) => `field-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <SortableField
              key={index}
              field={field}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={() => onSelect(index)}
              onRemove={() => onRemove(index)}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}
