// ===== THÊM HÀM NÀY VÀO CUỐI FILE HOẶC TRƯỚC KHI EXPORT =====
import { addBusinessDays } from 'date-fns' // hoặc dùng date-fns/addDays
import { CollectionBeforeChangeHook } from 'payload'

export const autoSetExpireDate: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // Chỉ chạy khi TẠO MỚI (create)
  if (operation !== 'create') return data

  // Nếu đã có expire_at rồi (hiếm) → giữ nguyên
  if (data.expire_at) return data

  // Lấy createdAt, nếu chưa có thì lấy Date.now()
  const createdAt = new Date().toISOString()

  // Cộng thêm 30 ngày
  const expireDate = new Date(createdAt)
  expireDate.setDate(expireDate.getDate() + 30)

  return {
    ...data,
    expire_at: expireDate.toISOString(),
  }
}