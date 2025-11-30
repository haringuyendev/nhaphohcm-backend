'use server'

import { getPayload, Where } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { uploadMedia } from './media'
import { Media } from '@/payload-types'

const toArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  return []
}

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getProperty_types() {
  const payload = await getPayload({ config: configPromise })
  try {
    const property_types = await payload.find({
      collection: 'property_type',
      draft: false,
      limit: 0,
      overrideAccess: false,
      select: { label: true, value: true },
      sort: 'label',
    })
    return property_types.docs
  } catch (error) {
    console.error('Error fetching property_types:', error)
    return []
  }
}
const removeVietnameseTones = (str: string): string => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
}
export async function getProperties(params: any) {
  const validLimits = [10, 20, 50]
  const limit = validLimits.includes(Number(params.limit)) ? Number(params.limit) : 10
  const currentPage = Number(params.page) || 1
  const payload = await getPayload({ config: configPromise })

  const priceMin = params.price_min ? parseFloat(params.price_min.toString()) : undefined
  const priceMax = params.price_max ? parseFloat(params.price_max.toString()) : undefined
  const areaMin = params.area_min ? parseFloat(params.area_min.toString()) : undefined
  const areaMax = params.area_max ? parseFloat(params.area_max.toString()) : undefined

  const searchConditions: Where[] = []
  const search_query = (params.search || params.q)?.toString().trim() || ''
  const cleanQuery = search_query ? removeVietnameseTones(search_query) : ''
  const slugQuery = search_query ? toSlug(search_query) : ''
  if (search_query && cleanQuery) {
    const words = cleanQuery.split(/\s+/).filter((w) => w.length >= 2)

    // 1. Tìm trong title, description, address (không dấu)
    searchConditions.push(
      { title: { contains: cleanQuery } },
      { description: { contains: cleanQuery } },
      { address: { contains: cleanQuery } },
    )

    // 2. Tìm từng từ riêng lẻ (để ra kết quả dù gõ lộn xộn)
    words.forEach((word) => {
      searchConditions.push(
        { title: { contains: word } },
        { description: { contains: word } },
        { address: { contains: word } },
      )
    })

    // 3. Tìm quận / phường (cả có dấu và không dấu)
    searchConditions.push(
      { 'district.name': { contains: search_query } },
      { 'district.name': { contains: cleanQuery } },
      { 'ward.name': { contains: search_query } },
      { 'ward.name': { contains: cleanQuery } },
    )

    // 4. Tìm trong slug (đã không dấu rồi)
    searchConditions.push({ slug: { contains: slugQuery } })
  }
  const whereConditions: Where = {
    and: [
      { is_published: { equals: true } },
      { is_hidden: { equals: false } },
      {
        or: [
          { expire_at: { exists: false } },
          { expire_at: { greater_than_equal: new Date().toISOString() } },
        ],
      },
      ...(searchConditions.length > 0 ? [{ or: searchConditions }] : []),
      ...(params.p_types ? [{ 'type.value': { in: toArray(params.p_types) } }] : []),
      ...(params.d ? [{ 'district.code': { in: toArray(params.d).map(Number) } }] : []),
      ...(params.w ? [{ 'ward.code': { in: toArray(params.w).map(Number) } }] : []),
      ...(priceMin !== undefined ? [{ price: { greater_than_equal: priceMin } }] : []),
      ...(priceMax !== undefined ? [{ price: { less_than_equal: priceMax } }] : []),
      ...(areaMin !== undefined ? [{ area: { greater_than_equal: areaMin } }] : []),
      ...(areaMax !== undefined ? [{ area: { less_than_equal: areaMax } }] : []),
    ],
  }

  const properties = await payload.find({
    collection: 'properties',
    draft: false,
    overrideAccess: false,
    limit,
    page: currentPage,
    sort: ['-is_vip', '-bumped_at', '-created_at'],
    select: {
      title: true,
      slug: true,
      price: true,
      area: true,
      address: true,
      images: true,
      type: true,
      province: true,
      district: true,
      description: true,
      ward: true,
      is_vip: true,
      vip_expire_at: true,
      bumped_at: true,
      created_at: true,
      expire_at: true,
      seller: true,
    },
    where: whereConditions,
  })

  return properties
}

// endpoints/common/properties.ts
export async function getPropertiesByStatus(params: {
  status?: 'published' | 'unpublished' | 'deleted' | 'expired' | 'expiring'
  page?: string
  limit?: string
  user?: any
  search?: string
}) {
  const payload = await getPayload({ config: configPromise })

  const limit = [10, 20, 50].includes(Number(params.limit)) ? Number(params.limit) : 10
  const page = Number(params.page) || 1

  const now = new Date()
  const nowISO = now.toISOString()
  const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()

  const seller = params.user.id

  // === XÂY DỰNG WHERE ===
  let where: any = { seller: { equals: seller } }

  // 1. Lọc theo status
  if (params.status) {
    const statusConditions: any[] = []

    switch (params.status) {
      case 'published':
        statusConditions.push(
          { is_published: { equals: true } },
          { is_hidden: { equals: false } },
          {
            or: [{ expire_at: { exists: false } }, { expire_at: { greater_than_equal: nowISO } }],
          },
        )
        break
      case 'unpublished':
        statusConditions.push({ is_published: { equals: false } }, { is_hidden: { equals: false } })
        break
      case 'deleted':
        statusConditions.push({ is_hidden: { equals: true } })
        break
      case 'expired':
        statusConditions.push({ expire_at: { less_than: nowISO } })
        break
      case 'expiring':
        statusConditions.push(
          { expire_at: { greater_than_equal: nowISO } },
          { expire_at: { less_than_equal: fiveDaysLater } },
        )
        break
    }

    if (statusConditions.length > 0) {
      where = {
        and: [where, ...statusConditions],
      }
    }
  }

  // 2. Thêm SEARCH nếu có
  if (params.search?.trim()) {
    const searchTerm = params.search.trim()

    const searchConditions = {
      or: [
        { title: { contains: searchTerm } },
        { address: { contains: searchTerm } },
        { description: { contains: searchTerm } }, // nếu có
      ],
    }

    where = where.and
      ? { and: [where, searchConditions] }
      : { and: [{ seller: { equals: seller } }, searchConditions] }
  }

  // === QUERY ===
  const result = await payload.find({
    collection: 'properties',
    where,
    page,
    limit,
    sort: ['-is_vip', '-bumped_at', '-created_at'],
    depth: 2,
  })

  // === MAP DATA ===
  const list = result.docs.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    area: p.area,
    address: p.address,
    images: (p.images || []).map((img: any) => ({
      id: img.id,
      image: {
        id: img.image?.id,
        url: img.image?.url || `${process.env.PAYLOAD_URL}/media/${img.image?.filename}`,
        filename: img.image?.filename,
      },
    })),
    type: p.type || { value: '', label: '' },
    province: { id: p.province?.id, name: p.province?.name },
    district: { id: p.district?.id, name: p.district?.name },
    ward: p.ward ? { id: p.ward?.id, name: p.ward?.name } : null,
    is_vip: !!p.is_vip,
    bumped_at: p.bumped_at,
    created_at: p.created_at,
    expire_at: p.expire_at,
    seller: {
      id: p.seller?.id,
      name: p.seller?.name,
      phone: p.seller?.phone,
    },
    is_published: !!p.is_published,
    is_hidden: !!p.is_hidden,
  }))

  return {
    list,
    pagination: {
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    },
  }
}

export async function getPropertyStats(user: any) {
  const payload = await getPayload({ config: configPromise })

  const now = new Date()
  const nowISO = now.toISOString()
  const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // === TỐI ƯU: DÙNG 1 LẦN payload.count() + aggregation ===
  const [total, published, unpublished, deleted, expired, expiring, bumpedToday, neverBumped] =
    await Promise.all([
      payload.count({ collection: 'properties', where: { seller: { equals: user.id } } }),
      payload.count({
        collection: 'properties',
        where: {
          and: [
            { seller: { equals: user.id } },
            { is_published: { equals: true } },
            { is_hidden: { equals: false } },
            {
              or: [
                { expire_at: { exists: false } },
                { expire_at: { greater_than_equal: nowISO } },
                { seller: { equals: user.id } },
              ],
            },
          ],
        },
      }),
      payload.count({
        collection: 'properties',
        where: {
          and: [
            { seller: { equals: user.id } },
            { is_published: { equals: false } },
            { is_hidden: { equals: false } },
          ],
        },
      }),
      payload.count({
        collection: 'properties',
        where: { seller: { equals: user.id }, is_hidden: { equals: true } },
      }),
      payload.count({
        collection: 'properties',
        where: { seller: { equals: user.id }, expire_at: { less_than: nowISO } },
      }),
      payload.count({
        collection: 'properties',
        where: {
          and: [
            { seller: { equals: user.id } },
            { expire_at: { greater_than_equal: nowISO } },
            { expire_at: { less_than_equal: fiveDaysLater } },
          ],
        },
      }),
      payload.count({
        collection: 'properties',
        where: { seller: { equals: user.id }, bumped_at: { greater_than_equal: yesterday } },
      }),
      payload.count({
        collection: 'properties',
        where: { seller: { equals: user.id }, bumped_at: { exists: false } },
      }),
    ])

  return {
    total: total.totalDocs,
    published: published.totalDocs,
    unpublished: unpublished.totalDocs,
    deleted: deleted.totalDocs,
    expired: expired.totalDocs,
    expiring: expiring.totalDocs,
    bumped_today: bumpedToday.totalDocs,
    never_bumped: neverBumped.totalDocs,
  }
}

// ==================================================================
// 1. HẠ TIN / ĐĂNG LẠI
// ==================================================================
export async function togglePublish(id: string, current: boolean) {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'properties',
      id,
      data: { is_published: !current },
    })

    revalidatePath('/admin/quan-ly-tin-dang')
    return { success: true, data: { id, is_published: !current } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật trạng thái' }
  }
}

// ==================================================================
// 2. XÓA MỀM (ẨN TIN)
// ==================================================================
export async function softDeleteProperty(id: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'properties',
      id,
      data: { is_hidden: true, is_published: false },
    })

    revalidatePath('properties')
    return { success: true, data: { id } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa mềm' }
  }
}

// ==================================================================
// 3. KHÔI PHỤC TIN
// ==================================================================
export async function restoreProperty(id: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'properties',
      id,
      data: { is_hidden: false, is_published: true },
    })

    revalidatePath('/admin/quan-ly-tin-dang')
    return { success: true, data: { id } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi khôi phục' }
  }
}

// ==================================================================
// 4. UPLOAD ẢNH → trả về URL
// ==================================================================
export async function uploadImage(
  file: File,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Làm sạch tên file
    const sanitize = (name: string) =>
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')

    const safeName = sanitize(file.name)
    const fileName = `${Date.now()}-${safeName}`

    // Tạo FormData
    const formData = new FormData()
    formData.append('file', file, fileName)

    // Gọi API upload của Payload
    const res = await fetch(`${process.env.PAYLOAD_URL}/api/media`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        // Không set Content-Type → browser tự set boundary
      },
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Upload failed: ${err}`)
    }

    const media = await res.json()
    const url = media.url || `${process.env.PAYLOAD_URL}${media.file}`

    return { success: true, url }
  } catch (error: any) {
    return { success: false, error: error.message || 'Upload thất bại' }
  }
}

// ==================================================================
// 5. XÓA ẢNH
// ==================================================================
export async function deleteImage(mediaId: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'media',
      id: mediaId,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa ảnh' }
  }
}

// ==================================================================
// 6. BUMP TIN (đẩy tin lên)
// ==================================================================
export async function bumpProperty(id: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const now = new Date().toISOString()

    const result = await payload.update({
      collection: 'properties',
      id,
      data: {
        bumped_at: now,
        last_bumped_at: now,
      },
      depth: 0,
    })

    revalidatePath('/admin/quan-ly-tin-dang')
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi bump tin' }
  }
}

// ==================================================================
// 7. CẬP NHẬT VIP
// ==================================================================
export async function updateVipStatus(id: string, days: number, isVip: boolean) {
  try {
    const payload = await getPayload({ config: configPromise })
    const now = new Date()
    const expire = new Date()
    expire.setDate(now.getDate() + days)

    await payload.update({
      collection: 'properties',
      id,
      data: {
        is_vip: isVip,
        vip_activated_at: isVip ? now.toISOString() : null,
        vip_expire_at: isVip ? expire.toISOString() : null,
      },
    })

    revalidatePath('/admin/quan-ly-tin-dang')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật VIP' }
  }
}

// ==================== 1. GET PROPERTY BY ID ====================
export async function getPropertyById(id: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const property = await payload.findByID({
      collection: 'properties',
      id,
      select: {
        title: true,
        description: true,
        province: true,
        district: true,
        ward: true,
        address: true,
        type: true,
        area: true,
        price: true,
        images: true,
        meta:true,
        slug:true
      },
    })

    if (!property) {
      return { success: false, error: 'Không tìm thấy tin đăng' }
    }

    return { success: true, data: property }
  } catch (error: any) {
    console.error('Get property error:', error)
    return { success: false, error: 'Lỗi khi lấy dữ liệu tin đăng' }
  }
}

// ==================== 2. CREATE PROPERTY ====================
// src/endpoints/common/properties.ts

// ==================== CREATE PROPERTY – META OPTIONAL ====================
export const createProperty = async (data: any) => {
  const payload = await getPayload({ config: configPromise })

  try {
    const rawData = data instanceof FormData ? Object.fromEntries(data.entries()) : data

    // XỬ LÝ ẢNH (giữ nguyên code đẹp của bạn)
    let imagesPayload: any[] = []
    if (rawData.images) {
      if (typeof rawData.images === 'string') {
        try { imagesPayload = JSON.parse(rawData.images) } catch {}
      } else if (Array.isArray(rawData.images)) {
        imagesPayload = rawData.images
      }
    }

    // Parse description
    let descriptionJson
    try {
      descriptionJson = typeof rawData.description === 'string'
        ? JSON.parse(rawData.description)
        : rawData.description
    } catch {
      return { success: false, error: 'Mô tả không hợp lệ' }
    }

    // CHỈ TẠO meta NẾU CÓ ÍT NHẤT 1 TRƯỜNG
    const meta = {} as any
    if (rawData.metaTitle?.trim()) meta.title = rawData.metaTitle.trim()
    if (rawData.metaDescription?.trim()) meta.description = rawData.metaDescription.trim()
    if (rawData.metaImage) meta.image = rawData.metaImage

    const hasMeta = Object.keys(meta).length > 0

    const propertyData = {
      title: rawData.title as string,
      seller: rawData.seller as string,
      description: descriptionJson,
      type: rawData.type,
      price: Number(rawData.price),
      area: Number(rawData.area),
      province: rawData.province,
      district: rawData.district,
      ward: rawData.ward || undefined,
      address: rawData.address as string,
      images: imagesPayload,
      ...(hasMeta && { meta }), // CHỈ THÊM meta NẾU CÓ DỮ LIỆU
    }

    const property = await payload.create({
      collection: 'properties',
      data: propertyData,
      draft: false,
    })

    revalidatePath('/admin')
    revalidatePath('/')

    return { success: true, data: property }
  } catch (err: any) {
    console.error('Create property error:', err)
    return {
      success: false,
      error: err?.data?.errors?.[0]?.message || err.message || 'Tạo tin thất bại',
    }
  }
}

// ==================== UPDATE PROPERTY – META OPTIONAL ====================
export async function updateProperty(id: string, formData: any) {
  const payload = await getPayload({ config: configPromise })
  try {
    const rawData = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

    // XỬ LÝ ẢNH
    const imagesFromClient = Array.isArray(rawData.images) ? rawData.images : []
    if (imagesFromClient.length === 0) {
      return { success: false, error: 'Vui lòng tải lên ít nhất 1 ảnh' }
    }

    const finalImages = imagesFromClient.map((item: any) => {
      const result: any = { image: item.image?.id || item.image || item.mediaId }
      if (item.id && typeof item.id === 'string' && item.id.length > 10) {
        result.id = item.id
      }
      return result
    })

    // Parse description
    let descriptionJson: any
    try {
      descriptionJson = typeof rawData.description === 'string'
        ? JSON.parse(rawData.description)
        : rawData.description
    } catch {
      return { success: false, error: 'Mô tả không hợp lệ' }
    }

    // TẠO meta CHỈ KHI CÓ DỮ LIỆU
    const meta = {} as any
    if (rawData.metaTitle?.trim()) meta.title = rawData.metaTitle.trim()
    if (rawData.metaDescription?.trim()) meta.description = rawData.metaDescription.trim()
    if (rawData.metaImage) meta.image = rawData.metaImage

    const hasMeta = Object.keys(meta).length > 0

    const payloadData = {
      title: rawData.title,
      description: descriptionJson,
      type: rawData.type,
      price: Number(rawData.price),
      area: Number(rawData.area),
      province: rawData.province,
      district: rawData.district,
      ward: rawData.ward || undefined,
      address: rawData.address,
      images: finalImages,
      ...(hasMeta && { meta }), // CHỈ GỬI meta NẾU CÓ DỮ LIỆU
    }

    const res = await payload.update({
      collection: 'properties',
      id: id,
      data: payloadData,
    })

    revalidatePath('/admin')
    revalidatePath(`/tin-dang/${id}`)

    return { success: true, message: 'Cập nhật tin thành công!' }
  } catch (error: any) {
    console.error('Update property error:', error)
    throw error
  }
}