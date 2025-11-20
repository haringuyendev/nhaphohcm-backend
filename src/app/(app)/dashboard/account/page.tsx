import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import AccountUpdate from '@/components/Property/admin/AccountUpdate'

export default async function Page() {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) {
        return redirect('/login')
    }

    return <AccountUpdate user={user} />
}