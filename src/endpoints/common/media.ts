// src/actions/uploadMedia.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function uploadMedia(file: File) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Làm sạch tên file (giống Supabase)
    const sanitize = (name: string) =>
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')

    const safeName = sanitize(file.name)
    const timestamp = Date.now()
    const filename = `${timestamp}-${safeName}`

    // 2. Đọc file thành Buffer (BẮT BUỘC với Payload local API)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 3. Upload bằng Payload local API (đúng format)
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: file.name.split('.').slice(0, -1).join('.') || 'Hình ảnh bất động sản',
      },
      file: {
        data: buffer,
        mimetype: file.type || 'application/octet-stream',
        name: file.name,
        size: file.size,
      },
      // Tùy chọn: tự đặt đường dẫn trong thư mục media
      filePath: `properties/${filename}`,
    })

    // 4. Trả về URL công khai
    const url = `/media/${media.filename}`

    return {
      success: true,
      url,
      id: media.id,
      filename: media.filename,
    }
  } catch (error: any) {
    console.error('Upload media failed:', error)
    return {
      success: false,
      error: error.message || 'Upload ảnh thất bại',
    }
  }
}