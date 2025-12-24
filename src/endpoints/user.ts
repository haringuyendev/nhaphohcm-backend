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
      overrideAccess: true,
    })

    return { success: true, message: 'Đặt lại mật khẩu thành công!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Token không hợp lệ hoặc đã hết hạn' }
  }
}

export async function updateProfileAction(formData: any) {
  const rawData = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'users',
      id: rawData.user,
      data: {
        name: rawData.name,
        email: rawData.email,
        phone: rawData.phone,
        avatar: rawData.avatar,
      },
    })

    return { success: true, message: 'Cập nhật thông tin thành công!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Cập nhật thông tin thất bại' }
  }
}

export async function getUserByIdAction(id: string) {
  const payload = await getPayload({ config: configPromise })

  const user = await payload.find({
    collection: 'users',
    where: {
      id: {
        equals: id,
      },
    },
  })

  return user
}
