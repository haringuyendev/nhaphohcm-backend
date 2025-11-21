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
export const getMediaBlurUrl = (media: any): string => {
  if (!media) return ""
  if (typeof media === "string") return media // nếu là string → đã là url
  if (media.blurhash) return media.blurhash
  return ""
}

export const getValue = (entity: any, field: string): any => {
  if (!entity) return null
  if (typeof entity === "string") return entity
  return entity[field] ?? null
}

export const formatPrice = (price: number): string => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,   // Tối đa 2 chữ số thập phân
    minimumFractionDigits: 0,   // Không bắt buộc có thập phân
  });

  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000;
    // Nếu là số nguyên tỷ → không hiện .0
    const formatted = billions % 1 === 0 
      ? formatter.format(billions).replace(/,\d+$/, "") 
      : formatter.format(billions);
    return `${formatted} tỷ`;
  } else {
    const millions = price / 1_000_000;
    const formatted = millions % 1 === 0 
      ? formatter.format(millions).replace(/,\d+$/, "") 
      : formatter.format(millions);
    return `${formatted} triệu`;
  }
};