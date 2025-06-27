"use client";

import { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { useAtom, useAtomValue } from "jotai";
import { companiesAtom } from "@/store/companies";
import { selectionFilterAtom } from "@/store/filter-atom";
import { Status } from "@prisma/client";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { translateStatus } from "@/utils/statusTranslator";

import { DroppableContainer } from "@/components/dnd-kit/droppable";
import { SortableCardItem } from "@/components/dnd-kit/sortableItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

type SelectionWithCompany = InferResponseType<
  typeof client.api.company.$get,
  200
>[number]["selections"][number] & {
  companyName: string;
  companyId: string;
};

type Column = {
  id: Status;
  title: string;
  selections: SelectionWithCompany[];
};

const KanbanPage = () => {
  const [companiesData, refetchCompanies] = useAtom(companiesAtom);
  const selectionFilter = useAtomValue(selectionFilterAtom);
  const { data: companies, isPending, error } = companiesData;

  const initialColumns = useMemo((): Column[] => {
    const allSelections: SelectionWithCompany[] =
      companies?.flatMap((company) =>
        company.selections.map((selection) => ({
          ...selection,
          companyName: company.name,
          companyId: company.id,
        }))
      ) ?? [];

    const filteredSelections =
      selectionFilter === "ALL"
        ? allSelections
        : allSelections.filter(
            (selection) => selection.type === selectionFilter
          );

    return Object.values(Status).map((status) => ({
      id: status,
      title: translateStatus(status),
      selections: filteredSelections.filter(
        (selection) => selection.status === status
      ),
    }));
  }, [companies, selectionFilter]);
  
  const [kanbanColumns, setKanbanColumns] = useState<Column[]>(initialColumns);
  const [activeSelection, setActiveSelection] =
    useState<SelectionWithCompany | null>(null);

  useEffect(() => {
    setKanbanColumns(initialColumns);
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const findColumn = (id: string | null) => {
    if (!id) return null;
    if (kanbanColumns.some((col) => col.id === id)) {
      return kanbanColumns.find((col) => col.id === id) ?? null;
    }
    return (
      kanbanColumns.find((col) => col.selections.some((s) => s.id === id)) ??
      null
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const selection = initialColumns
      .flatMap((col) => col.selections)
      .find((s) => s.id === active.id);
    if (selection) {
      setActiveSelection(selection);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveASelection = active.data.current?.type === "Selection";
    const isOverASelection = over.data.current?.type === "Selection";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveASelection) return;

    if (isOverASelection) {
      // 別のSelectionの上にドラッグした場合
      const activeColumnId = active.data.current?.selection.status;
      const overColumnId = over.data.current?.selection.status;

      if (activeColumnId !== overColumnId) {
        // Not implemented: Move card between columns by hovering over another card
      }
    } else if (isOverAColumn) {
       // カラムの上に直接ドラッグした場合
       const activeColumnId = active.data.current?.selection.status;
       const overColumnId = over.id as Status;
 
       if (activeColumnId !== overColumnId) {
         // Not implemented: This logic is handled in onDragEnd for simplicity
       }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveSelection(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    const originalColumns = kanbanColumns;
    const selectionToMove = activeColumn.selections.find(
      (s) => s.id === activeId
    );

    if (!selectionToMove) return;

    // Optimistic Update
    setKanbanColumns((prev) => {
      const activeSelections = prev.find(
        (c) => c.id === activeColumn.id
      )!.selections;
      const overSelections = prev.find(
        (c) => c.id === overColumn.id
      )!.selections;

      const newActiveSelections = activeSelections.filter(
        (s) => s.id !== activeId
      );
      
      const overIndex = overSelections.findIndex(s => s.id === overId);
      const newIndex = overIndex >= 0 ? overIndex : overSelections.length;

      const newOverSelections = [...overSelections];
      newOverSelections.splice(newIndex, 0, {...selectionToMove, status: overColumn.id});


      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, selections: newActiveSelections };
        }
        if (col.id === overColumn.id) {
          return { ...col, selections: newOverSelections };
        }
        return col;
      });
    });

    try {
      await client.api.company.selection[":selectionId"].status.$patch({
        param: { selectionId: activeId },
        json: { status: overColumn.id },
      });
      (refetchCompanies as (update: { type: "refetch" }) => void)({
        type: "refetch",
      });
    } catch (err) {
      console.error("Failed to update selection status:", err);
      setKanbanColumns(originalColumns); // Revert on error
      // TODO: Add user-facing error notification
    }
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex w-full overflow-x-auto p-8 gap-6">
          {Object.values(Status).map((status) => (
            <div key={status} className="w-80 flex-shrink-0">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        エラーが発生しました: {error.message}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-[calc(100vh-4rem)] bg-gray-50">
        <div className="mt-16 flex h-full min-w-fit items-start gap-6 overflow-x-auto p-8">
          {kanbanColumns.map((col) => (
            <DroppableContainer
              key={col.id}
              id={col.id}
              title={col.title}
              selectionCount={col.selections.length}
            >
              <SortableContext items={col.selections.map((s) => s.id)}>
                <div className="flex flex-col gap-3">
                  {col.selections.map((selection) => (
                    <SortableCardItem key={selection.id} selection={selection} />
                  ))}
                  {col.selections.length === 0 && (
                     <div className="flex justify-center items-center h-24 text-sm text-gray-500">
                        <Building2 className="mr-2 h-4 w-4"/>
                        <span>該当なし</span>
                     </div>
                  )}
                </div>
              </SortableContext>
            </DroppableContainer>
          ))}
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(
        <DragOverlay>
          {activeSelection && (
            <SortableCardItem selection={activeSelection} isOverlay />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default KanbanPage; 