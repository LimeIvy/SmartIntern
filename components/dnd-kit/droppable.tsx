import { useDroppable } from "@dnd-kit/core";
import { Status } from "@prisma/client";

type DroppableContainerProps = {
  children: React.ReactNode;
  id: Status;
  title: string;
  selectionCount: number;
};

export const DroppableContainer = ({
  id,
  title,
  selectionCount,
  children,
}: DroppableContainerProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-80 min-w-80 flex-shrink-0 flex-col rounded-lg border bg-gray-100 p-4 shadow-sm transition-colors duration-200
      ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
          {selectionCount}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
