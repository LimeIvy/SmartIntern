import { UniqueIdentifier } from "@dnd-kit/core";

export function SortableItem({ itemId }: { itemId: UniqueIdentifier }) {
  return (
    <div className="flex h-24 w-full items-center justify-center border-2 border-dashed border-slate-300/50">
      {`id:${itemId}`}
    </div>
  );
}
