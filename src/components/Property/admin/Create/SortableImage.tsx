// components/Property/admin/Create/SortableImage.tsx
'use client'

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"
import Image from "next/image"
import { memo, useEffect, useState } from "react"

interface SortableImageProps {
  id: string
  url: string
  blurDataURL?: string
  onRemove: () => void
}

export const SortableImage = memo(function SortableImage({
  id,
  url,
  blurDataURL,
  onRemove,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none" as const,
  }

  const isBlob = url.startsWith("blob:")
  const shouldUseBlur = !isBlob && !!blurDataURL

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(
        typeof window !== "undefined" &&
        (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          "ontouchstart" in window ||
          window.innerWidth < 768)
      )
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group rounded-lg overflow-hidden border bg-muted/50 select-none"
    >
      <Image
        src={url}
        alt="Property preview"
        width={400}
        height={300}
        className="w-full h-32 object-cover"
        placeholder={shouldUseBlur ? "blur" : undefined}
        blurDataURL={shouldUseBlur ? blurDataURL : undefined}
        unoptimized={isBlob}
        quality={75}
      />

      {/* Drag Handle – nhỏ gọn, luôn hiện trên mobile */}
      <div
        {...attributes}
        {...listeners}
        className={`
          absolute top-1.5 left-1.5 z-10 
          bg-white/90 backdrop-blur-sm 
          p-1.5 rounded-md shadow-md 
          transition-all duration-200 touch-none
          ${isMobile 
            ? "opacity-0" 
            : "opacity-0 group-hover:opacity-90"
          }
        `}
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Nút Xóa – nhỏ, tròn, luôn hiện trên mobile */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className={`
          absolute top-1.5 right-1.5 z-10 
          w-7 h-7 rounded-full 
          flex items-center justify-center 
          shadow-md transition-all duration-200

          ${isMobile
            ? "bg-red-500 text-white opacity-90 hover:bg-red-600"
            : "bg-red-500/90 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600"
          }
        `}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Hiệu ứng khi đang kéo */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/40 border-2 border-primary border-dashed rounded-lg pointer-events-none" />
      )}
    </div>
  )
})