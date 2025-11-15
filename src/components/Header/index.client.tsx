'use client'
import Link from 'next/link'
import React, { useEffect } from 'react'

import type { Header } from 'src/payload-types'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '../ui/button'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Settings } from 'lucide-react'
import { useFilter } from '@/hooks/use-filter'
import { getMediaUrl } from '@/lib/utils'
import Image from 'next/image'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()
  const { setFilterOpen, searchQuery, setSearchQuery } = useFilter()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()

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
    <header className="bg-card border-b sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/">
              {header.logo && <Image src={getMediaUrl(header.logo)} alt="Logo" className="w-24 h-24" width={100} height={100} />}
            </Link>
            <Link href="/admin" className="lg:hidden">
              <Settings className="w-6 h-6" />
            </Link>
          </div>

          {/* Search box */}
          <div className="flex-1 max-w-2xl flex gap-2">
            {isMobile ? (
              // MOBILE: Click vào ô tìm kiếm → mở Sheet
              header.searchBar && <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setFilterOpen(true)}
              >
                <Search className="w-4 h-4 mr-2" />
                {searchQuery || "Tìm kiếm bất động sản..."}
              </Button>
            ) : (
              // DESKTOP: Giữ nguyên
              header.searchBar && <>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm bất động sản..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => updateSearchParams('search', searchQuery)}
                  className="bg-accent hover:bg-accent/90 hidden sm:flex"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Button>
              </>
            )}
          </div>

          {/* Admin */}
          <div className="gap-2 justify-end hidden lg:flex">
            <Link href="/admin">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Quản lý tin đăng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header >
  )
}
