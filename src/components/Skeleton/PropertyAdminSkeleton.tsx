// components/Property/admin/PropertyCardSkeletonList.tsx
'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'

interface PropertyCardSkeletonListProps {
  count?: number
}

export default function PropertyCardSkeletonList({ count = 10 }: PropertyCardSkeletonListProps) {
  const isMobile = useIsMobile()

  // === SKELETON MOBILE ===
  const MobileSkeleton = () => (
    <Card className="overflow-hidden animate-pulse">
      {/* Ảnh */}
      <div className="relative aspect-[4/3] bg-muted">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-2 left-2">
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
      </div>

      {/* Info */}
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-full max-w-xs" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-7 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-3 pt-0 border-t bg-muted/30">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  )

  // === SKELETON DESKTOP (giữ nguyên) ===
  const DesktopSkeleton = () => (
    <Card className="p-4 hover:shadow-md transition-shadow animate-pulse">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-32 h-32 shrink-0">
          <Skeleton className="w-full h-full rounded-lg" />
          <div className="absolute top-2 left-2">
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-full max-w-md rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex gap-4 text-sm">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-full max-w-lg rounded" />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md bg-red-100 border border-red-300" />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6 my-4">
      {/* Tiêu đề */}
      <Skeleton className="h-7 w-48 rounded" />

      {/* Danh sách */}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {isMobile ? <MobileSkeleton /> : <DesktopSkeleton />}
        </div>
      ))}
    </div>
  )
}