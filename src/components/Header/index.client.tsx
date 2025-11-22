'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { useFilter } from '@/hooks/use-filter'
import { getMediaUrl, getMediaBlurUrl } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

import type { Header } from 'src/payload-types'
import { cn } from '@/utilities/cn'
import { useEffect } from 'react'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const { searchQuery, setSearchQuery } = useFilter()

  const updateSearchParams = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("search", value.trim())
    } else {
      params.delete("search")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const search = searchParams.get("search")
    if (search) {
      setSearchQuery(search)
    }
    else {
      setSearchQuery("")
    }
  }, [searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams(searchQuery)
  }

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16 lg:h-20">

          {/* === LOGO - Luôn hiện === */}
          <Link href="/" className="flex-shrink-0">
            {header.logo && (
              <Image
                src={getMediaUrl(header.logo)}
                alt="Logo"
                width={isMobile ? 140 : 180}
                height={isMobile ? 56 : 72}
                className="h-12 w-auto lg:h-16 object-contain"
                priority
                blurDataURL={getMediaBlurUrl(header.logo)}
              />
            )}
          </Link>

          {/* === SEARCH BAR - HIỆN CẢ MOBILE & DESKTOP === */}
          {header.searchBar && (
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />

                <Input
                  type="search"
                  placeholder="Tìm kiếm bất động sản..."
                  className="pl-10 pr-10 h-10 lg:h-11 text-sm lg:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchQuery("");
                      e.currentTarget.blur(); // optional: bỏ focus
                    }
                  }}
                />

                {/* Nút X */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => updateSearchParams("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors z-20"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}

                {/* Nút Tìm kiếm */}
                <Button
                  type="submit"
                  size={isMobile ? "icon" : "default"}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 transition-all z-10 right-1",
                  )}
                >
                  <Search className={isMobile ? "w-4 h-4" : "w-4 h-4 mr-2"} />
                  {!isMobile && "Tìm"}
                </Button>
              </div>
            </form>
          )}

          {/* === DESKTOP: Nút Quản lý === */}
          {!isMobile && (
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                Quản lý tin đăng
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}