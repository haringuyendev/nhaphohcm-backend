'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PropertyPaginationProps {
  currentPage: number
  totalPages: number
}

export function PropertyPagination({ currentPage, totalPages }: PropertyPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createURL = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return `?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => router.push(createURL(currentPage - 1))}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="flex items-center px-3 text-sm">
        Trang {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => router.push(createURL(currentPage + 1))}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}