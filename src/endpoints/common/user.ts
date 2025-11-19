// src/actions/reset-password.ts
'use server'

import { getPayload, Where } from 'payload'
import configPromise from '@payload-config'

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get('token')?.toString()
  const password = formData.get('password')?.toString()

  if (!token || !password) {
    return { success: false, error: 'Thiếu thông tin' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.resetPassword({
        collection: 'users',
        data: { token, password },
        overrideAccess: false
    })

    return { success: true, message: 'Đặt lại mật khẩu thành công!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Token không hợp lệ hoặc đã hết hạn' }
  }
}