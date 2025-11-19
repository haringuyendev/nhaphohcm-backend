'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getDistricts() {
  const payload = await getPayload({ config: configPromise })
  try {
    const provinces = await payload.find({
      collection: 'districts',
      draft: false,
      limit: 0,
      overrideAccess: false,
      select: { name: true, code: true },
      sort: 'name',
    })
    return provinces.docs
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return []
  }
}

export async function getDistrictsByProvince(province_code: number) {
  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.find({
      collection: "districts",
      where: {
        "province.code": { equals: province_code },
      },
      limit: 0,
      pagination: false,
      depth: 0,
      sort: "name",
    })

    return result.docs
  } catch (error) {
    console.error("Error fetching districts by province:", error)
    return []
  }
}