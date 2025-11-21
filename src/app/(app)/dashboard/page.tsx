// app/admin/page.tsx

import PropertyListClient from "@/components/Property/admin/PropertyList.client"
import PropertyListServer from "@/components/Property/admin/PropertyList.server"
import FilterButtons from "@/components/Property/admin/PropertyFiltersButton.server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, LogOut } from "lucide-react"
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { AdminSidebar } from "@/components/Property/admin/AdminSidebar"
import { Metadata } from "next"
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph"
interface PageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    limit?: string
    search?: string
  }>
}

export default async function AdminPage({ searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const params = await searchParams

  if (!user) {
    return redirect('/login')
  }

  const status = params.status as
    | 'published'
    | 'unpublished'
    | 'deleted'
    | 'expired'
    | 'expiring'
    | undefined

  const currentPage = Number(params.page) || 1
  const limit = [10, 20, 50].includes(Number(params.limit)) ? Number(params.limit) : 10

  return (
    <PropertyListClient currentStatus={status}>
      {/* Header */}
      <header className="bg-card border-b mb-4 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="lg:text-2xl text-lg font-bold">Quản lý Bất động sản</h1>
            <div className="flex items-center gap-2">
              <Button asChild size="lg" className="bg-accent hover:bg-primary">
                <Link href="/dashboard/dang-tin" className="lg:text-base text-sm">
                  <Plus className="lg:w-4 lg:h-4 lg:mr-2 w-3 h-3 mr-1" />
                  Đăng tin mới
                </Link>
              </Button>

            </div>
          </div>
        </div>
      </header>
      <FilterButtons currentStatus={status} user={user} />
      <PropertyListServer
        status={status}
        currentPage={currentPage}
        limit={limit}
        user={user}
        search={params.search}
      />
    </PropertyListClient>
  )
}
export const metadata: Metadata = {
  title: 'Quản lý Bất  động sản',
  description: 'Quản lý Bất động sản',
  openGraph: mergeOpenGraph({
    title: 'Quản lý Bất động sản',
    url: '/dashboard',
  }),
}