'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { useFilter } from '@/hooks/use-filter'
import { getMediaUrl } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, Settings, Filter } from 'lucide-react'

import type { Header } from 'src/payload-types'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const { setFilterOpen, searchQuery, setSearchQuery } = useFilter()

  const isAdminPage = pathname === '/tin-dang/admin'

  useEffect(() => {
    const search = searchParams.get("search")
    setSearchQuery(search || "")
  }, [searchParams])

  const updateSearchParams = (name: string, value: string) => {
    // Create a new URLSearchParams instance from the current params
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

    if (value) {
      currentParams.set(name, value);
    } else {
      currentParams.delete(name);
    }

    router.push(`${pathname}?${currentParams.toString()}`);
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">

          {/* === LOGO === */}
          <Link href="/" className="flex items-center">
            {header.logo && (
              <Image
                src={getMediaUrl(header.logo)}
                alt="Logo"
                width={isMobile ? 64 : 96}
                height={isMobile ? 64 : 96}
                className="w-16 h-16 lg:w-24 lg:h-24 object-contain"
                priority
              />
            )}
          </Link>

          {/* === DESKTOP: SEARCH BAR + QUẢN LÝ === */}
          {!isMobile && (
            <div className="flex items-center gap-3 flex-1 max-w-4xl">
              {/* Search Bar */}
              {header.searchBar && (
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm bất động sản..."
                      className="pl-10"
                      defaultValue={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => updateSearchParams("search", searchQuery)} className="bg-accent hover:bg-accent/90">
                    <Search className="w-4 h-4 mr-2" />
                    Tìm
                  </Button>
                </div>
              )}

              {/* Quản lý + Bộ lọc */}
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/tin-dang/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Quản lý
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* === MOBILE: CHỈ NÚT SETTINGS (Sheet) === */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Quản lý & Bộ lọc</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" size="lg" className="justify-start">
                    <Link href="/tin-dang/admin">
                      <Settings className="w-5 h-5 mr-3" />
                      Quản lý tin đăng
                    </Link>
                  </Button>

                  {!isAdminPage && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="justify-start"
                      onClick={() => {
                        setFilterOpen(true)
                        // Đóng sheet
                        document.querySelector('[data-radix-sheet-close]')?.dispatchEvent(
                          new MouseEvent('click', { bubbles: true })
                        )
                      }}
                    >
                      <Filter className="w-5 h-5 mr-3" />
                      Bộ lọc tìm kiếm
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}