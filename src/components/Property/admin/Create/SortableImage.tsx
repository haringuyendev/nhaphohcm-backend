// components/SortableImage.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import Image from "next/image";

interface SortableImageProps {
  id: string;
  url: string;
  onRemove: () => void;
}

export const SortableImage = ({ id, url, onRemove }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <Image
        src={url}
        alt=""
        width={200}
        height={200}
        className="w-full h-32 object-cover rounded-lg border"
      />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 bg-white/80 p-1 rounded cursor-move opacity-0 group-hover:opacity-100 transition"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};