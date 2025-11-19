import PropertyPageClient from '@/components/Property/PropertyList.client'
import PropertyListServer from '@/components/Property/PropertyListServer'

type SearchParams = { [key: string]: string | string[] | undefined }
type Props = { searchParams: Promise<SearchParams>, style: string }


export default async function PropertyListBlock({ searchParams, style }: Props) {
  const {
    page,
    limit: limitParam,
    ...restParams
  } = await searchParams
  const validLimits = [10, 20, 50]
  const limit = validLimits.includes(Number(limitParam)) ? Number(limitParam) : 10
  const currentPage = Number(page) || 1

  return (
    <PropertyPageClient>
      <PropertyListServer filters={restParams} limit={limit} currentPage={currentPage} />
    </PropertyPageClient>
  )
}
