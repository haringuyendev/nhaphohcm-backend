// app/admin/PropertyListServer.tsx
import { getPropertiesByStatus } from '@/endpoints/properties'
import { Property } from '@/payload-types'
import { Suspense } from 'react'
// import PropertyListSkeleton from '../Skeleton/PropertyListSkeleton'
import PropertyAdminSkeleton from '@/components/Skeleton/PropertyAdminSkeleton'
import { PropertyPagination } from '../Pagination'
import PropertyCard from './PropertyCard.client'

interface PropertyListServerProps {
  status?: 'published' | 'unpublished' | 'deleted' | 'expired' | 'expiring' | undefined
  currentPage: number
  limit: number
  user?: any
  search?: string
}

async function PropertyListContent({ status, currentPage, limit, user, search }: PropertyListServerProps) {
  const { list, pagination } = await getPropertiesByStatus({
    status: status as 'published' | 'unpublished' | 'deleted' | 'expired' | 'expiring' | undefined,
    page: currentPage.toString(),
    limit: limit.toString(),
    user,
    search
  })

  const properties = list as Property[]

  return (
    <div>
      <div className="container mx-auto px-0">
        <p className="text-muted-foreground mb-4">
          Hiển thị: <strong>{properties.length}</strong> / {pagination.total} tin
        </p>

        {properties.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Không có tin nào trong mục này.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <PropertyPagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default function PropertyListServer(props: PropertyListServerProps) {
  return (
    <Suspense key={JSON.stringify(props)} fallback={<PropertyAdminSkeleton count={10} />}>
      <PropertyListContent {...props} />
    </Suspense>
  )
}