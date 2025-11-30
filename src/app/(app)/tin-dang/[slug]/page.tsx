// src/app/[slug]/page.tsx

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import PropertyDetail from '@/components/Property/PropertyDetail'
import { getValue, lexicalToPlainText } from '@/lib/utils'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Media } from '@/payload-types'
import { Reason } from '@/data/common'
import NotFoundComponent from '@/components/Property/NotFound'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const property = await queryPropertyBySlug({ slug })

  if (!property) return notFound()

  // 1. LẤY ẢNH CHO OG
  const gallery = (property.images || [])
    .map((item: any) => (typeof item.image === 'object' ? item.image : null))
    .filter(Boolean) as any[]

  const metaImage = typeof property.meta?.image === 'object' ? property.meta.image : null
  const seoImage = metaImage || gallery[0] || null

  // 2. TẠO OPEN GRAPH IMAGES (chỉ khi có ảnh)
  const ogImages = seoImage
    ? [
        {
          url: seoImage.url,
          width: seoImage.width ?? 1200,
          height: seoImage.height ?? 630,
          alt: seoImage.alt || property.title,
        },
      ]
    : undefined

  // 3. TITLE: Ưu tiên meta.title → fallback về title gốc
  const pageTitle = property.meta?.title?.trim() || property.title

  // 4. DESCRIPTION: Ưu tiên meta.description → fallback về Lexical JSON → text rút gọn 160 ký tự
  let pageDescription = ''
  if (property.meta?.description?.trim()) {
    pageDescription = property.meta.description.trim()
  } else if (property.description) {
    const plainText = lexicalToPlainText(property.description)
    pageDescription = plainText.length > 160
      ? plainText.slice(0, 157) + '...'
      : plainText || 'Xem chi tiết tin đăng bất động sản'
  } else {
    pageDescription = 'Xem chi tiết tin đăng bất động sản'
  }

  // 5. ROBOTS
  const canIndex = property.is_published === true

  return {
    title: pageTitle,
    description: pageDescription,

    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: ogImages,
      type: 'website',
      locale: 'vi_VN',
    },

    twitter: ogImages
      ? {
          card: 'summary_large_image',
          title: pageTitle,
          description: pageDescription,
          images: ogImages,
        }
      : undefined,

    robots: {
      index: canIndex,
      follow: canIndex,
      googleBot: {
        index: canIndex,
        follow: canIndex,
      },
    },
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


    if (!property || !property.docs || property.docs.length === 0) {
        return notFound()
    }
    if(property?.docs?.[0]?.is_published === false) {
        return <NotFoundComponent reason={Reason.EXPIRED} />
    }
    if(property?.docs?.[0]?.is_hidden === true) {
        return <NotFoundComponent reason={Reason.HIDDEN} />
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
