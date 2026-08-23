"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { MODULE_META } from "@/lib/constants/modules";
import type { ModuleKey } from "@/types/settings";

interface ModuleOrderListProps {
  order: ModuleKey[];
  onReorder: (newOrder: ModuleKey[]) => void;
}

function SortableRow({ moduleKey }: { moduleKey: ModuleKey }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: moduleKey,
  });
  const meta = MODULE_META[moduleKey];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2.5 border-b border-app-border py-2.5 last:border-none ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="سحب لإعادة الترتيب"
        className="touch-none cursor-grab text-app-text-2"
      >
        <GripVertical size={16} />
      </button>
      <span className="flex-1 text-[13.5px] font-semibold text-app-text">
        {meta.icon} {meta.label}
      </span>
    </div>
  );
}

export default function ModuleOrderList({
  order,
  onReorder,
}: ModuleOrderListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as ModuleKey);
    const newIndex = order.indexOf(over.id as ModuleKey);
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  if (order.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-app-text-2">
        مفيش صفحات مختارة لسه
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        {order.map((key) => (
          <SortableRow key={key} moduleKey={key} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
