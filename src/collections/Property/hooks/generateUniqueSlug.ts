// src/collections/Property/hooks/generateUniqueSlug.ts
import type { CollectionBeforeChangeHook } from 'payload'

export const generateUniqueSlug: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // QUAN TRỌNG NHẤT: Chỉ chạy khi TẠO MỚI
  if (operation !== 'create') {
    return data // Update → bỏ qua hoàn toàn, không đụng vào slug
  }

  // Nếu đã có slug rồi (hiếm) → giữ nguyên
  if (data.slug) return data

  const title = data.title || 'tin-khong-ten'

  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!baseSlug) {
    return { ...data, slug: `tin-${Date.now()}` }
  }

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await req.payload.find({
      collection: 'properties',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) break

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return { ...data, slug }
}