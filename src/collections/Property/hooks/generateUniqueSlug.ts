// src/collections/Property/hooks/generateUniqueSlug.ts
import type { CollectionBeforeChangeHook } from 'payload'

export const generateUniqueSlug: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  // Chỉ chạy khi tạo mới hoặc khi title thay đổi
  if (operation === 'update' && !data.title) return data

  const title = data.title || 'tin-khong-ten'
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')   // bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!baseSlug) return { ...data, slug: 'tin-moi' }

  let slug = baseSlug
  let counter = 1

  // Kiểm tra trùng → thêm số
  while (true) {
    const existing = await req.payload.find({
      collection: 'properties',
      where: {
        slug: { equals: slug },
        id: { not_equals: data.id || '' }, // bỏ qua chính nó khi update
      },
      limit: 1,
    })

    if (existing.docs.length === 0) break // không trùng → dùng luôn

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return { ...data, slug }
}