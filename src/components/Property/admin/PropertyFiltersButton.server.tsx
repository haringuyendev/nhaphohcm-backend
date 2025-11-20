import { Button } from '@/components/ui/button'
import { getPropertyStats } from '@/endpoints/common/properties'
import Link from 'next/link'

interface FilterButtonsProps {
  currentStatus?: string
  user?: any
}

export default async function FilterButtons({ currentStatus, user }: FilterButtonsProps) {
  const stats = await getPropertyStats(user)

  const filters = [
    { key: undefined, label: 'Tất cả', count: stats.total },
    { key: 'published', label: 'Đang hiển thị', count: stats.published },
    { key: 'unpublished', label: 'Đã hạ', count: stats.unpublished },
    { key: 'deleted', label: 'Đã xóa', count: stats.deleted },
    { key: 'expired', label: 'Hết hạn', count: stats.expired },
    { key: 'expiring', label: 'Sắp hết hạn', count: stats.expiring },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ key, label, count }) => (
        <Button
          key={key ?? 'all'}
          variant={currentStatus === key ? 'default' : 'outline'}
          asChild
          className="rounded-full text-sm"
        >
          <Link
            href={{
              pathname: '/dashboard',
              query: { ...(key && { status: key }), page: 1 },
            }}
            replace
          >
            {label} ({count})
          </Link>
        </Button>
      ))}
    </div>
  )
}