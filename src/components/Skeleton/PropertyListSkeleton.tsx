// src/components/PropertyList.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '../ui/button'
import { Phone } from 'lucide-react'

export default function PropertyListSkeleton() {
    return (
        <div className="grid w-full grid-cols-1 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl w-full shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {/* === IMAGE GALLERY SKELETON === */}
                    <div className="relative">
                        {/* Main Image */}
                        <Skeleton className="w-full h-64 rounded-t-2xl" />

                        {/* Thumbnail Grid */}
                        <div className="absolute bottom-4 right-4 grid grid-cols-2 gap-1">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <Skeleton className="w-16 h-16 rounded-lg" />
                        </div>
                    </div>

                    {/* === CONTENT === */}
                    <div className="p-4 space-y-3">
                        {/* Title */}
                        <Skeleton className="h-7 w-full rounded-md" />
                        <Skeleton className="h-7 w-4/5 rounded-md" />

                        {/* Price & Stats */}
                        <div className="flex items-center gap-3 text-sm">
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>

                        {/* Address */}
                        <div className="flex items-center gap-2 text-gray-600">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-64" />
                        </div>

                        {/* === FOOTER === */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-20 mt-1" />
                                </div>
                            </div>

                            <Button disabled className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-4 py-2">
                                <Phone className="w-4 h-4 mr-1" />
                                <Skeleton className="h-4 w-24" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}