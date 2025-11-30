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
export const getDayAgo = (date: string | null): string => {
  if (!date) return 'Vừa xong'

  const now = new Date()
  const target = new Date(date)
  
  // Kiểm tra ngày không hợp lệ
  if (isNaN(target.getTime())) return 'Không xác định'

  const diffMs = now.getTime() - target.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Dưới 1 phút
  if (diffSeconds < 60) return 'Vừa xong'

  // Dưới 1 giờ
  if (diffMinutes < 60) return `${diffMinutes} phút trước`

  // Hôm nay (cùng ngày)
  if (diffDays === 0) {
    if (diffHours < 24) return `${diffHours} giờ trước`
    return 'Hôm nay'
  }

  // Hôm qua
  if (diffDays === 1) return 'Hôm qua'

  // 2-6 ngày trước
  if (diffDays < 7) return `${diffDays} ngày trước`

  // 7-29 ngày trước
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? 'Tuần trước' : `${weeks} tuần trước`
  }

  // Trên 30 ngày → trả về định dạng ngày tháng đẹp
  return target.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
// utils/lexical-to-text.ts (tạo file này để dùng lại ở nhiều nơi)
export const lexicalToPlainText = (lexicalValue: any): string => {
  if (!lexicalValue || !lexicalValue.root?.children) return ''

  const extractText = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'text') return node.text || ''
        if (node.children && Array.isArray(node.children)) {
          return extractText(node.children)
        }
        return ''
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return extractText(lexicalValue.root.children)
}