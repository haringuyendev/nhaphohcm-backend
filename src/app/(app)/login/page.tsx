import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import LoginForm from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto">
          <LoginForm />
      </div>
    </div>
    
  )
}

export const metadata: Metadata = {
  description: 'Đăng nhập để đăng tin.',
  openGraph: {
    title: 'Đăng nhập',
    url: '/login',
  },
  title: 'Đăng nhập',
}
