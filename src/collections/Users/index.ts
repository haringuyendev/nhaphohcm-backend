import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { publicAccess } from '@/access/publicAccess'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'

import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: () => true,
    update: ({ req: { user }, id }) => {
    // 1. Nếu là Admin, cho phép tất cả
    if (user?.roles?.includes('admin')) return true;

    if (user && id && user.id === id) {
      return true; 
    }

    if (user) return true;

    return false;
  },
  },
  admin: {
    group: 'Users',
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  defaultPopulate: {
    name: true,
    roles: true,
    phone: true,
    avatar: true,
    expoPushToken: true,
  },
  auth: {
    tokenExpiration: 1209600,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token
        const user = args?.user
        // Use the token provided to allow your user to reset their password
        const resetPasswordURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`

        return `
          <!doctype html>
          <html>
            <body>
              <h1>Đây là email đặt lại mật khẩu từ Nhaphohcm.com.vn!</h1>
              <p>Hello, ${user.email}!</p>
              <p>Click below to reset your password.</p>
              <p>
                <a href="${resetPasswordURL}">${resetPasswordURL}</a>
              </p>
            </body>
          </html>
        `
      },
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email', // vẫn để type: 'email' để có UI đẹp
      required: true,
      unique: true,
      // TẮT VALIDATE MẶC ĐỊNH
      validate: async (val) => {
        if (!val) return 'Email là bắt buộc'

        // Regex đơn giản hơn, chấp nhận hầu hết email thực tế
        const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!simpleEmailRegex.test(val)) {
          return 'Email không hợp lệ'
        }

        return true
      },
    },
    {
      name: 'roles',
      type: 'select',
      required: true,
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ['editor'],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'editor',
          value: 'editor',
        },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      maxDepth: 2,
    },
    {
      name: 'expoPushToken',
      type: 'text',
      required: false,
    },
    {
      name: 'favoriteProperties',
      label: 'Tin yêu thích',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  endpoints: [
    {
      path: '/push-token',
      method: 'post',
      handler: async (req) => {
        try {
          if (!req) return Response.json({ error: 'Lỗi hệ thống' }, { status: 500 })
          // Lấy user từ JWT
          const user = req.user
          if (!user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }
          let data
          try {
            data = await req.json?.()
          } catch (e) {
            return Response.json({ error: 'Invalid JSON' }, { status: 400 })
          }
          const { expoPushToken } = data ?? {}
          if (!expoPushToken) {
            return Response.json({ error: 'Missing expoPushToken' }, { status: 400 })
          }

          // Cập nhật vào user
          const updated = await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { expoPushToken },
          })

          return Response.json({
            success: true,
            expoPushToken: updated.expoPushToken,
            message: 'Device token updated successfully',
          })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Server error' }, { status: 500 })
        }
      },
    },
    {
      path: '/toggle-favorite',
      method: 'post',
      handler: async (req) => {
        try {
          if (!req) return Response.json({ error: 'Lỗi hệ thống' }, { status: 500 })
          const user = req.user
          if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

          const { propertyId } = await req.json?.()
          if (!propertyId) return Response.json({ error: 'Missing propertyId' }, { status: 400 })

          const payload = req.payload

          // Lấy user hiện tại
          const current = await payload.findByID({
            collection: 'users',
            id: user.id,
          })
          const currentFavoritePropertiesID =
            current.favoriteProperties?.map((p: any) => p.id) || []
          const currentFavoriteProperties = current.favoriteProperties?.filter(
            (p: any) => p.id !== propertyId.toString(),
          )
          const alreadySaved = currentFavoritePropertiesID.includes(propertyId.toString())

          const updated = await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              favoriteProperties: alreadySaved
                ? currentFavoriteProperties
                : [...(current?.favoriteProperties || []), propertyId],
            },
          })

          return Response.json({
            success: true,
            isFavorite: !alreadySaved,
            favoriteProperties: updated.favoriteProperties ?? [],
          })
        } catch (err) {
          console.error(err)
          return Response.json({ error: 'Server error' }, { status: 500 })
        }
      },
    },
    {
      path: '/my-stats',
      method: 'get',
      handler: async (req: any) => {
        if (!req) return Response.json({ error: 'Lỗi hệ thống' }, { status: 500 })
        const user = req.user
        if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const now = new Date().toISOString()

        const baseWhere = { seller: { equals: user.id } }

        const [totalRes, publishedRes, hiddenRes, expiredRes, vipRes] = await Promise.all([
          // Tổng tất cả tin của user
          req.payload.count({
            collection: 'properties',
            where: baseWhere,
            limit: 0,
          }),

          // Đang published
          req.payload.count({
            collection: 'properties',
            where: {
              and: [baseWhere, { is_published: { equals: true } }],
            },
            limit: 0,
          }),

          req.payload.count({
            collection: 'properties',
            where: {
              and: [baseWhere, { is_published: { equals: false } }],
            },
            limit: 0,
          }),

          // Hết hạn (expire_at < now)
          req.payload.count({
            collection: 'properties',
            where: {
              and: [baseWhere, { expire_at: { less_than: now } }],
            },
            limit: 0,
          }),

          // Đang VIP (is_vip = true và chưa hết hạn)
          req.payload.count({
            collection: 'properties',
            where: {
              and: [
                baseWhere,
                { is_vip: { equals: true } },
                {
                  or: [
                    { vip_expire_at: { greater_than_equal: now } },
                    { vip_expire_at: { exists: false } },
                  ],
                },
              ],
            },
            limit: 0,
          }),
        ])
        return Response.json({
          total: totalRes,
          published: publishedRes,
          hidden: hiddenRes,
          expired: expiredRes,
          vip: vipRes,
        })
      },
    },
  ],
}
