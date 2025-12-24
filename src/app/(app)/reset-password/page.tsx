import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'
import ResetPassword from '@/components/forms/ResetPasswordForm'

type Args = {
  searchParams: Promise<{
    token: string
  }>
}
export default async function ResetPasswordPage({searchParams}: Args) {
    const paramsData = await searchParams
    const {token} = paramsData
    console.log('Reset password token:', token)
    if (!token) {
        return <div className="container">Token không hợp lệ</div>
    }
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
