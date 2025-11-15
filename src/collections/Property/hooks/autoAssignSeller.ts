import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Hook tự động gán `seller` và `created_at` khi tạo mới
 * Dùng ở mức collection (beforeChange)
 */
export const autoAssignSeller: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Chỉ chạy khi tạo mới
  if (operation !== 'create') {
    return data
  }

  // Tạo bản sao để tránh mutate
  const updatedData = { ...(data || {}) }

  // Gán seller nếu user tồn tại
  if (req.user?.id) {
    updatedData.seller = req.user.id
  }

  // Gán created_at nếu chưa có
  if (!updatedData.created_at) {
    updatedData.created_at = new Date().toISOString()
  }

  return updatedData
}