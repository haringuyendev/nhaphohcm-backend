import type { CollectionConfig } from 'payload'

export const PostLikes: CollectionConfig = {
  slug: 'postLikes',
  admin: { hidden: true },

  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
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
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
  ],

  indexes: [
    {
      fields: ['post', 'user'],
      unique: true, // mỗi user chỉ like 1 lần
    },
  ],

  hooks: {
    /** Khi like → tăng likeCount */
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        const payload = req.payload
        const postId = doc.post

        // lấy post hiện tại
        const post = await payload.findByID({
          collection: 'socialPosts',
          id: postId,
        })

        const newCount = (post.likeCount ?? 0) + 1

        // update likeCount
        await payload.update({
          collection: 'socialPosts',
          id: postId,
          data: { likeCount: newCount },
        })

        return doc
      },
    ],

    /** Khi unlike → giảm likeCount */
    afterDelete: [
      async ({ doc, req }) => {
        const payload = req.payload
        const postId = doc.post

        const post = await payload.findByID({
          collection: 'socialPosts',
          id: postId,
        })

        const newCount = Math.max(0, (post.likeCount ?? 0) - 1)

        await payload.update({
          collection: 'socialPosts',
          id: postId,
          data: { likeCount: newCount },
        })

        return doc
      },
    ],
  },
}
