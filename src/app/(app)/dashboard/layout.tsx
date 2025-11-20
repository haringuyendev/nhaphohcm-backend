import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { ensureStartsWith } from '@/utilities/ensureStartsWith'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import React, { Suspense } from 'react'
import '@/app/(app)/globals.css'
import { Be_Vietnam_Pro } from "next/font/google"
import { cn } from '@/lib/utils'
import { SidebarProvider } from '@/components/ui/sidebar'
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

        <Providers>
            <SidebarProvider>
                <AdminSidebar />
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </SidebarProvider>
        </Providers>
    )
}
