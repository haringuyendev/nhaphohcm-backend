import type { ReactNode } from 'react'

import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import React, { Suspense } from 'react'
import '@/app/(app)/globals.css'
import { Be_Vietnam_Pro } from "next/font/google"
import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/Property/admin/AdminSidebar'
import AdminBottomBar from '@/components/Property/admin/AdminBottomBar'

const beVietnam = Be_Vietnam_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-be-vietnam',
    display: 'swap',
})
export default async function AdminLayout({ children }: { children: ReactNode }) {

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                {children}
                <AdminBottomBar />
            </SidebarInset>
        </SidebarProvider>
    )
}
