'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getWards({ district_slug }: { district_slug: string[] }) {
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
        district:true,
        codename:true
      },
      where: {
        'district.codename': {
          in: district_slug,
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

export async function getWardsByDistrictSlug({ district_slug }: { district_slug: string }) {
  const payload = await getPayload({ config: configPromise })

  try {
    const wards = await payload.find({
      collection: 'wards',
      draft: false,
      overrideAccess: false,
      limit:0,
      where:{
        "district.codename":{
          equals:district_slug
        }
      },
      select: {
        name: true,
        code: true,
        district:true,
        codename:true
      },
      sort: 'name',
    })

    return wards.docs
  } catch (error) {
    console.error('Error fetching wards:', error)
    return []
  }
}
