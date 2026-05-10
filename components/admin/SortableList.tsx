"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { id: string };

/**
 * Generische Drag-and-Drop-Liste mit Magenta-Akzent.
 * Aufrufer reicht items rein und bekommt ein renderItem callback,
 * dem die einzelnen Items geliefert werden inkl. eines Drag-Handle-
 * Slots, den der Aufrufer in seinem Row-Design platzieren kann.
 *
 * onReorder feuert nach erfolgreichem Drag-End mit der NEUEN Reihenfolge.
 * Optimistisches UI: items werden lokal sofort umsortiert.
 */
export function SortableList<T extends Item>({
  items,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  onReorder: (neueIds: string[]) => void | Promise<void>;
  renderItem: (item: T, dragHandle: React.ReactNode) => React.ReactNode;
  className?: string;
}) {
  const [lokal, setLokal] = useState(items);

  // Externe Items-Änderung uebernehmen (z.B. nach revalidate).
  // Synchron auf Items-Identitaet prüfen waere Render-Loop;
  // useEffect mit ID-Liste als Key verhindert das.
  const idsKey = items.map((it) => it.id).join("|");
  useEffect(() => {
    setLokal(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // MouseSensor mit kleiner Distance-Threshold um versehentliches
  // Triggern bei Click-to-Edit zu vermeiden, aber niedrig genug
  // dass Drag sich responsive anfuehlt.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = lokal.findIndex((it) => it.id === active.id);
    const newIndex = lokal.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const neu = arrayMove(lokal, oldIndex, newIndex);
    setLokal(neu);
    void onReorder(neu.map((it) => it.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={lokal.map((it) => it.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={cn("space-y-2", className)}>
          {lokal.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Beim Drag etwas anheben + leicht transparent machen damit
    // der Hover-Highlight im Drop-Bereich besser sichtbar wird.
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  // setActivatorNodeRef zeigt dnd-kit, welches Element der "Handle"
  // ist. Listeners + attributes nur auf dem Handle, NICHT auf der
  // ganzen Row -- sonst startet jeder Klick irgendwo in der Row
  // einen Drag und macht Inline-Edit + Hover-Actions kaputt.
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      className="flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing sm:h-7 sm:w-7"
      aria-label="Zum Verschieben ziehen"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-shadow",
        isDragging && "shadow-lg ring-2 ring-[hsl(var(--primary)/0.4)]",
      )}
    >
      {children(handle)}
    </li>
  );
}
