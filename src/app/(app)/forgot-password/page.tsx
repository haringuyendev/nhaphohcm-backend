import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  return (
    <div className="container">
        <ForgotPasswordForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Nhập email của bạn để khôi phục mật khẩu.',
  openGraph: mergeOpenGraph({
    title: 'Quên mật khẩu',
    url: '/forgot-password',
  }),
  title: 'Quên mật khẩu',
}
