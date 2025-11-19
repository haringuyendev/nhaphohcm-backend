'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getWards({ district_code }: { district_code: number[] }) {
  const payload = await getPayload({ config: configPromise })

  try {
    const wards = await payload.find({
      collection: 'wards',
      draft: false,
      overrideAccess: false,
      limit:0,
      select: {
        name: true,
        code: true,
        district:true
      },
      where: {
        'district.code': {
          in: district_code,
        },
      },
      sort: 'name',
    })

    return wards.docs
  } catch (error) {
    console.error('Error fetching wards:', error)
    return []
  }
}

export async function getWardsByDistrictId({ district_code }: { district_code: number }) {
  const payload = await getPayload({ config: configPromise })

  try {
    const wards = await payload.find({
      collection: 'wards',
      draft: false,
      overrideAccess: false,
      limit:0,
      where:{
        "district.code":{
          equals:district_code
        }
      },
      select: {
        name: true,
        code: true,
        district:true
      },
      sort: 'name',
    })

    return wards.docs
  } catch (error) {
    console.error('Error fetching wards:', error)
    return []
  }
}
