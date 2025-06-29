import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { translateSelectionType } from "@/utils/statusTranslator";
import { Badge } from "@/components/ui/badge";

type SelectionWithCompany = InferResponseType<
  typeof client.api.company.$get,
  200
>[number]["selections"][number] & {
  companyName: string;
  companyId: string;
};

type SortableCardItemProps = {
  selection: SelectionWithCompany;
  isOverlay?: boolean;
};

export const SortableCardItem = ({
  selection,
  isOverlay,
}: SortableCardItemProps) => {
  const router = useRouter();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: selection.id,
    data: {
      type: "Selection",
      selection,
    },
  });

  const style = {
    transition: transition ?? undefined,
    transform: CSS.Transform.toString(transform),
  };

  const containerStyle = cva(
    "rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer",
    {
      variants: {
        isDragging: {
          true: "opacity-50 z-10",
        },
        isOverlay: {
          true: "ring-2 ring-blue-500 shadow-lg",
        },
      },
    }
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={containerStyle({
        isDragging: isDragging,
        isOverlay: isOverlay,
      })}
      onClick={() => router.push(`/companies/${selection.companyId}`)}
    >
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-gray-900">{selection.companyName}</h4>
        <p className="text-sm text-gray-700">{selection.name}</p>
        <Badge
          variant="outline"
          className="w-fit"
        >
          {translateSelectionType(selection.type)}
        </Badge>
      </div>
    </div>
  );
};
