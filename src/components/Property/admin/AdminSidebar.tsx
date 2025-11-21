'use client'

import { User, Users, FileText, LogOut } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"

const menuItems = [
    { title: "Quản lý tin đăng", url: "/dashboard", icon: FileText },
    { title: "Thông tin tài khoản", url: "/dashboard/account", icon: User },
    { title: "Quản lý tài khoản", url: "/dashboard/users", icon: Users },
]

export function AdminSidebar() {
    const pathname = usePathname()
    return (
        <Sidebar collapsible="icon">
            {/* ==================== MENU CHÍNH ==================== */}
            <SidebarContent>
                <SidebarGroup className="mt-24 h-screen">
                    <SidebarGroupLabel>Quản lý</SidebarGroupLabel>

                    <SidebarMenu>
                        {menuItems.map((item) => {
                            const isActive =
                                item.url === "/dashboard"
                                    ? pathname === "/dashboard" || pathname.startsWith("/dashboard/posts")
                                    : pathname === item.url

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive}>
                                        <Link href={item.url}>
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* ==================== FOOTER (dưới cùng) ==================== */}
            <SidebarFooter className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SidebarMenu className="gap-3">
                    {/* Nút thu gọn/mở rộng – chỉ hiện khi sidebar đã mở (desktop) */}
                    <SidebarMenuItem className="hidden md:block">
                        <SidebarTrigger className="w-full justify-start text-muted-foreground hover:text-foreground">
                            <span className="flex items-center gap-3">
                                {/* Icon sẽ tự đổi thành PanelLeft / PanelRight tùy trạng thái */}
                                <SidebarTrigger className="h-5 w-5" />
                                <span>Thu gọn menu</span>
                            </span>
                        </SidebarTrigger>
                    </SidebarMenuItem>

                    {/* Nút Đăng xuất */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Link href="/logout" className="flex items-center gap-3">
                                <LogOut className="h-5 w-5" />
                                <span>Đăng xuất</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}