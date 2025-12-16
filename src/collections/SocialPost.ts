// collections/posts.ts
import { CollectionConfig } from 'payload'

export const SocialPosts: CollectionConfig = {
  slug: 'socialPosts',
  labels: { singular: 'Bài viết', plural: 'Bài viết cộng đồng' },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: async ({ req, data }) => {
      const user = req.user
      if (!user) return false
      if (user.roles?.includes('admin')) return true

      // data chính là body đã được parse đúng cách, luôn là object
      const communityId = data?.community

      if (!communityId) return false

      const member = await req.payload.find({
        collection: 'members',
        where: {
          community: { equals: communityId },
          user: { equals: user.id },
          status: { equals: 'active' },
        },
        limit: 1,
      })

      return member.totalDocs > 0
    },
    update: async ({ req, id }) => {
      // Chỉ author, mod, admin của cộng đồng hoặc admin toàn hệ thống
      const user = req.user
      if (!user || !id) return false
      if (user.roles?.includes('admin')) return true

      const post = await req.payload.findByID({
        collection: 'socialPosts',
        id: id as string,
      })

      if ((post.author as any)?.id === user.id) return true

      // kiểm tra có phải mod/admin của cộng đồng không
      const member = await req.payload.find({
        collection: 'members',
        where: {
          community: { equals: post.community },
          user: { equals: user.id },
          role: { in: ['moderator', 'admin'] },
        },
        limit: 1,
      })

      return member.totalDocs > 0
    },
    delete: ({ req }) => {
      const user = req.user
      return !!user && user.roles?.includes('admin')
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    { name: 'content', type: 'richText' },
    {
      name: 'community',
      type: 'relationship',
      relationTo: 'communities',
      required: true,
      index: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }) => user?.id,
      admin: { readOnly: true },
    },
    {
      name: 'attachments',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'isHidden',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'likeCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          return { ...data, author: req.user.id }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        const io = (req.payload as any).io
        if (io) {
          io.to(`community_${doc.community}`).emit('post:changed', {
            operation: operation || 'update',
            post: doc,
          })
        }
        return doc
      },
    ],
  },
}
