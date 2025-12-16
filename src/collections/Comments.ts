// collections/comments.ts
import { CollectionConfig } from 'payload'

const canComment = async ({ req, postId }: any) => {
  const user = req.user
  if (!user) return false
  if (user.roles?.includes('admin')) return true

  const post = await req.payload.findByID({
    collection: 'socialPosts',
    id: postId,
  })

  if (!post) return false

  const member = await req.payload.find({
    collection: 'members',
    where: {
      community: { equals: post.community },
      user: { equals: user.id },
      status: { equals: 'active' },
    },
    limit: 1,
  })

  return member.totalDocs > 0
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    read: () => true,
    // collections/comments.ts
    create: async ({ req, data }) => {
      const user = req.user
      if (!user) return false
      if (user.roles?.includes('admin')) return true

      const postId = data?.post
      if (!postId) return false

      const post = await req.payload.findByID({
        collection: 'socialPosts',
        id: postId,
      })
      if (!post) return false

      const member = await req.payload.find({
        collection: 'members',
        where: {
          community: { equals: post.community },
          user: { equals: user.id },
          status: { equals: 'active' },
        },
        limit: 1,
      })

      return member.totalDocs > 0
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user && req.user.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'socialPosts',
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
    { name: 'text', type: 'textarea', required: true },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      filterOptions: ({ siblingData, id }) => {
        // id = ID của comment hiện tại (khi đang edit/create)
        if (!id) return true // khi tạo mới → cho phép chọn tất cả

        return {
          id: { not_equals: id },
        }
      },
    },
    {
      name: 'isHidden',
      type: 'checkbox',
      defaultValue: false,
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
      async ({ doc, req }) => {
        const io = (req.payload as any).io
        if (io && doc.post) {
          const postId = typeof doc.post === 'object' ? doc.post.id : doc.post
          io.to(`post_${postId}`).emit('comment:changed', doc)
        }
        return doc
      },
    ],
  },
}
