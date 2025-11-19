// src/app/[slug]/page.tsx

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import PropertyDetail from '@/components/Property/PropertyDetail'
import { getValue } from '@/lib/utils'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Media } from '@/payload-types'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const property = await queryPropertyBySlug({ slug })

  if (!property) return notFound()

  const gallery = property.images?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof property.meta?.image === 'object' ? property.meta?.image : undefined
  const canIndex = property.is_published === true

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: property.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: property.meta?.title || property.title,
  }
}

export default async function PropertyDetailPage({ params }: Args) {
    const { slug } = await params

    const payload = await getPayload({ config: configPromise })

    const property = await payload.find({
        collection: 'properties',
        where: {
            slug: { equals: slug },
        },
        draft: false,
        overrideAccess: false,
    })

    if (!property) {
        throw new Error('Property not found')
    }

    // Lấy danh sách phường trong quận
    const wardStats = await payload.find({
        collection: 'wards',
        where: {
            'district.code': { equals: getValue(property.docs[0].district, 'code') },
        },
        select: {
            name: true,
            code: true,
            district:true,
            propertyCount: true,
        },
        sort: '-propertyCount',
        limit: 50,
    })

    const relatedProperties = await payload.find({
        collection: 'properties',
        where: {
            'district.code': { equals: getValue(property.docs[0].district, 'code') },
            id: { not_equals: property.docs[0].id },
            is_published: { equals: true },
        },
        limit: 4,
        sort: '-created_at',
    })

    return (
        <PropertyDetail
            property={property.docs[0]}
            wardStats={wardStats.docs}
            relatedProperties={relatedProperties.docs}
        />
    )
}

const queryPropertyBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'properties',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ is_published: { equals: true } }, { is_hidden: { equals: false } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
