import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import PostProperty from '@/components/Property/admin/Create/CreateOrUpdateForm'
import { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default async function PostPropertyPage() {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) {
        return redirect('/login')
    }

    return <PostProperty user={user} />
}
export const metadata: Metadata = {
  title: 'Đăng tin',
  description: 'Trang đăng tin',
  openGraph: mergeOpenGraph({
    title: 'Đăng tin',
    url: '/dashboard/dang-tin',
  }),
}