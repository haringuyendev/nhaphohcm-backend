// app/admin/post-property/[id]/page.tsx
import PostProperty from '@/components/Property/admin/Create/CreateOrUpdateForm'
import { getPropertyById } from '@/endpoints/properties'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

type Args = {
    params: Promise<{
        slug: string
    }>
}

export default async function PostPropertyPage({ params }: Args) {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) {
        return redirect('/login')
    }

    const { slug } = await params
    const property = await getPropertyById(slug)

    return <PostProperty user={user} property={property.data} />
}
export const metadata: Metadata = {
  title: 'Sửa tin',
  description: 'Trang sửa tin',
  openGraph: mergeOpenGraph({
    title: 'Sửa tin',
    url: '/dashboard/[slug]',
  }),
}
