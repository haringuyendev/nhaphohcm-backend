import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import ResetPassword from '@/components/forms/ResetPasswordForm'

type Args = {
  params: Promise<{
    token: string
  }>
}
export default async function ResetPasswordPage({params}: Args) {
    const {token} = await params
  return (
    <div className="container">
        <ResetPassword token={token} />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Đặt lại mật khẩu',
  openGraph: mergeOpenGraph({
    title: 'Đặt lại mật khẩu',
    url: '/reset-password',
  }),
  title: 'Đặt lại mật khẩu',
}
