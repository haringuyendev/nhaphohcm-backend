import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { Suspense } from 'react'

import type { Page } from '@/payload-types'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}
type SearchParams = { [key: string]: string | string[] | undefined }
type Args = {
  params: Promise<SearchParams>
}
type PageProps = {
  // params contains the dynamic route segments (e.g., { slug: 'about-us' })
  params: Promise<{ slug: string | string[] | undefined }>;
  // searchParams contains the query parameters (e.g., { page: '2' })
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const urlSlug = Array.isArray(slug) ? slug.join('/') : slug || 'home'
  const searchParamsValue = await searchParams
  const page = await queryPageBySlug({
    slug: urlSlug as string,
  })

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  return (
    <article>
      <Suspense fallback={<div>Loading...</div>}>
        <RenderHero {...hero} />
        <RenderBlocks blocks={layout} searchParams={searchParamsValue} />
      </Suspense>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({
    slug: slug as string,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
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
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
