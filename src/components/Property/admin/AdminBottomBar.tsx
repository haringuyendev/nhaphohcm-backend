// components/ui/BottomNavbar.tsx
'use client'

import { Home, PlusCircle, User as UserIcon, Search, LogOut, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useFilter } from "@/hooks/use-filter"

export default function BottomNavbar() {
  const pathname = usePathname()
  const { setFilterOpen } = useFilter() // ← Lấy hàm mở filter

  const authnavItems = [
    { icon: Home, label: "Trang chủ", path: "/", isHighlight: false },
    { 
      icon: Search, 
      label: "Tìm kiếm", 
      action: () => setFilterOpen(true), // ← Click thì mở filter
      isHighlight: false 
    },
    { icon: PlusCircle, label: "Đăng tin", path: "/dashboard/dang-tin", isHighlight: true },
    { icon: UserIcon, label: "Tài khoản", path: "/dashboard/account", isHighlight: false },
    { icon: LogOut, label: "Đăng xuất", path: "/logout", isHighlight: false },
  ]

  const publicnavItems = [
    { icon: Home, label: "Trang chủ", path: "/", isHighlight: false },
    { 
      icon: Search, 
      label: "Tìm kiếm", 
      action: () => setFilterOpen(true), // ← Cũng mở filter luôn
      isHighlight: false 
    },
    { icon: PlusCircle, label: "Quản lý", path: "/dashboard", isHighlight: true },
    { 
      icon: Phone, 
      label: "Liên hệ", 
      path: "tel:0931693579", 
      isHighlight: false,
      isTel: true // ← Dùng để phân biệt link tel
    },
  ]

  const navItems = pathname.startsWith("/dashboard") ? authnavItems : publicnavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 pb-safe md:hidden">
      <div className="flex items-end justify-around px-2 py-2 relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path

          // Trường hợp có action (như mở filter)
          if (item.action) {
            return (
              <button
                key={index}
                onClick={item.action}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[60px]",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] text-center font-medium">{item.label}</span>
              </button>
            )
          }

          // Các nút bình thường
          return (
            <Link
              key={index}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] text-center font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}