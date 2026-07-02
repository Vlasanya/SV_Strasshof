"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/admin/actions";

export function useSortableList<T extends { id: number }>(
  initial: T[],
  onReorder: (ids: number[]) => Promise<ActionResult>,
) {
  const [items, setItems] = useState(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const row = (e.currentTarget as HTMLElement).closest("tr");
    if (row) e.dataTransfer.setDragImage(row, 24, 20);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && dragIndex !== index) setOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    const previous = items;

    setItems(next);
    setDragIndex(null);
    setOverIndex(null);

    startTransition(async () => {
      const res = await onReorder(next.map((item) => item.id));
      if (!res.ok) {
        setItems(previous);
        toast.error(res.error ?? "Reihenfolge konnte nicht gespeichert werden");
      }
    });
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return {
    items,
    dragIndex,
    overIndex,
    pending,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
