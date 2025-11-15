// app/logout/page.tsx
import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Suspense } from 'react'
import { LogoutPage } from './LogoutPage'

export default function Logout() {
  return (
    <div className="container max-w-lg my-16">
        <LogoutPage />
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Đăng xuất',
  description: 'Bạn đã được đăng xuất thành công.',
  openGraph: mergeOpenGraph({
    title: 'Đăng xuất',
    url: '/logout',
  }),
}