'use server'

import { getPayload, Where } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

const toArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  return []
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

export async function getProperties(params: any) {
  const validLimits = [10, 20, 50]
  const limit = validLimits.includes(Number(params.limit)) ? Number(params.limit) : 10
  const currentPage = Number(params.page) || 1
  const payload = await getPayload({ config: configPromise })
  const search_query = (params.search || params.q)?.toString().trim() || ''

  const priceMin = params.price_min ? parseFloat(params.price_min.toString()) : undefined
  const priceMax = params.price_max ? parseFloat(params.price_max.toString()) : undefined
  const areaMin = params.area_min ? parseFloat(params.area_min.toString()) : undefined
  const areaMax = params.area_max ? parseFloat(params.area_max.toString()) : undefined

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
      ...(search_query
        ? [
            {
              or: [
                { title: { contains: search_query.toLowerCase() } },
                { description: { contains: search_query.toLowerCase() } },
              ],
            },
          ]
        : []),
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

export async function getPropertiesByStatus(params: {
  status?: 'published' | 'unpublished' | 'deleted' | 'expired' | 'expiring'
  page?: string
  limit?: string
}){
  const payload = await getPayload({ config: configPromise })

  const limit = [10, 20, 50].includes(Number(params.limit)) ? Number(params.limit) : 10
  const page = Number(params.page) || 1

  const now = new Date()
  const nowISO = now.toISOString()
  const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // === WHERE THEO STATUS ===
  let where: any = {}

  switch (params.status) {
    case 'published':
      where = {
        and: [
          { is_published: { equals: true } },
          { is_hidden: { equals: false } },
          {
            or: [
              { expire_at: { exists: false } },
              { expire_at: { greater_than_equal: nowISO } },
            ],
          },
        ],
      }
      break

    case 'unpublished':
      where = {
        and: [
          { is_published: { equals: false } },
          { is_hidden: { equals: false } },
        ],
      }
      break

    case 'deleted':
      where = { is_hidden: { equals: true } }
      break

    case 'expired':
      where = { expire_at: { less_than: nowISO } }
      break

    case 'expiring':
      where = {
        and: [
          { expire_at: { greater_than_equal: nowISO } },
          { expire_at: { less_than_equal: fiveDaysLater } },
        ],
      }
      break

    default:
      where = {
        and: [
          { is_published: { equals: true } },
          { is_hidden: { equals: false } },
          {
            or: [
              { expire_at: { exists: false } },
              { expire_at: { greater_than_equal: nowISO } },
            ],
          },
        ],
      }
  }

  // === LẤY DANH SÁCH + POPULATE ===
  const result = await payload.find({
    collection: 'properties',
    where,
    page,
    limit,
    sort: ['-is_vip', '-bumped_at', '-created_at'],
    depth: 2, // đủ để populate: province, district, ward, seller, images.image
  })

  // === TÍNH STATS (song song) ===
  const [
    totalCount,
    publishedCount,
    unpublishedCount,
    deletedCount,
    expiredCount,
    expiringCount,
    bumpedTodayCount,
    neverBumpedCount,
  ] = await Promise.all([
    payload.find({ collection: 'properties', limit: 0, where: {} }).then(r => r.totalDocs),
    payload.find({
      collection: 'properties',
      limit: 0,
      where: {
        and: [
          { is_published: { equals: true } },
          { is_hidden: { equals: false } },
          { or: [{ expire_at: { exists: false } }, { expire_at: { greater_than_equal: nowISO } }] },
        ],
      },
    }).then(r => r.totalDocs),
    payload.find({
      collection: 'properties',
      limit: 0,
      where: { and: [{ is_published: { equals: false } }, { is_hidden: { equals: false } }] },
    }).then(r => r.totalDocs),
    payload.find({ collection: 'properties', limit: 0, where: { is_hidden: { equals: true } } }).then(r => r.totalDocs),
    payload.find({ collection: 'properties', limit: 0, where: { expire_at: { less_than: nowISO } } }).then(r => r.totalDocs),
    payload.find({
      collection: 'properties',
      limit: 0,
      where: {
        and: [
          { expire_at: { greater_than_equal: nowISO } },
          { expire_at: { less_than_equal: fiveDaysLater } },
        ],
      },
    }).then(r => r.totalDocs),
    payload.find({
      collection: 'properties',
      limit: 0,
      where: { bumped_at: { greater_than_equal: yesterday } },
    }).then(r => r.totalDocs),
    payload.find({
      collection: 'properties',
      limit: 0,
      where: { bumped_at: { equals: null } },
    }).then(r => r.totalDocs),
  ])

  const stats = {
    total: totalCount,
    published: publishedCount,
    unpublished: unpublishedCount,
    deleted: deletedCount,
    expired: expiredCount,
    expiring: expiringCount,
    bumped_today: bumpedTodayCount,
    never_bumped: neverBumpedCount,
  }

  // === FORMAT LIST (giống Supabase) ===
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
    province: {
      id: p.province?.id,
      name: p.province?.name,
      code: p.province?.code,
    },
    district: {
      id: p.district?.id,
      name: p.district?.name,
      code: p.district?.code,
    },
    ward: p.ward
      ? {
          id: p.ward?.id,
          name: p.ward?.name,
          code: p.ward?.code,
        }
      : null,
    is_vip: p.is_vip || false,
    bumped_at: p.bumped_at,
    created_at: p.created_at,
    expire_at: p.expire_at,
    seller: {
      id: p.seller?.id,
      name: p.seller?.name,
      phone: p.seller?.phone,
      avatar: p.seller?.avatar,
    },
    is_published: p.is_published || false,
    is_hidden: p.is_hidden || false,
  }))

  return {
    list,
    stats,
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
export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
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