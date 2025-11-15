import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// utils/media.ts
export const getMediaUrl = (media: any): string => {
  if (!media) return ""
  if (typeof media === "string") return media // nếu là string → đã là url
  if (media.url) return media.url
  return ""
}

export const getValue = (entity: any, field: string): any => {
  if (!entity) return null
  if (typeof entity === "string") return entity
  return entity[field] ?? null
}