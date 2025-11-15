// src/app/[slug]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="aspect-video rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    </div>
  )
}