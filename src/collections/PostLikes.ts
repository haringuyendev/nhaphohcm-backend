import type { CollectionConfig } from 'payload'
async function syncLikeCount(payload: any, postId: string | { id: string }) {
  const id = typeof postId === 'object' ? postId.id : postId

  try {
    const { totalDocs } = await payload.find({
      collection: 'postLikes',
      where: { post: { equals: id } },
      limit: 0,
      pagination: false,
    })

    await payload.update({
      collection: 'socialPosts',
      id,
      data: { likeCount: totalDocs },
    })
  } catch (error) {
    console.error('Failed to sync likeCount for post:', id, error)
  }
}
export const PostLikes: CollectionConfig = {
  slug: 'postLikes',
  admin: { hidden: true },

  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },

  defaultPopulate: {
    post: {
      id: true,
      likeCount: true,
      commentCount: true,
    },
    user: {
      id: true,
    },
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
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          await syncLikeCount(req.payload, doc.post)
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await syncLikeCount(req.payload, doc.post)
        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/toggle',
      method: 'post',
      handler: async (req) => {
        const user = req.user
        if (!user) {
          return Response.json({ message: 'Yêu cầu đăng nhập' }, { status: 401 })
        }
        if (!req.json) {
          return Response.json({ message: 'Yêu cầu dữ liệu JSON' }, { status: 400 })
        }
        // Payload tự parse JSON body → req.body là object
        const body = await req.json()
        const { post: postId } = body

        if (!postId || typeof postId !== 'string') {
          return Response.json({ message: 'Thiếu hoặc sai post ID' }, { status: 400 })
        }

        const payload = req.payload
        const io = (payload as any).io

        try {
          // Kiểm tra post tồn tại (tùy chọn nhưng tốt)
          const post = await payload
            .findByID({
              collection: 'socialPosts',
              id: postId,
              depth: 0,
            })
            .catch(() => null)

          if (!post) {
            return Response.json({ message: 'Bài viết không tồn tại' }, { status: 404 })
          }

          // Tìm like hiện tại
          const existing = await payload.find({
            collection: 'postLikes',
            where: {
              post: { equals: postId },
              user: { equals: user.id },
            },
            limit: 1,
          })

          const hasLiked = existing.totalDocs > 0
          let liked: boolean

          if (hasLiked) {
            // Unlike
            await payload.delete({
              collection: 'postLikes',
              id: existing.docs[0].id,
            })
            liked = false
          } else {
            // Like
            await payload.create({
              collection: 'postLikes',
              data: {
                post: postId,
                user: user.id,
              },
            })
            liked = true
            if (io) {
              io.emit('COLLECTION_CHANGED', {
                collection: 'socialPosts',
                operation: 'update',
                user: user,
                doc: post,
              })
            } else {
              console.log('Skipping emit - no io for post:', postId)
            }
          }

          const updatedPost = await payload.findByID({
            collection: 'socialPosts',
            id: postId,
            depth: 0,
          })

          return Response.json({
            success: true,
            liked,
            likeCount: updatedPost.likeCount,
          })
        } catch (error: any) {
          console.error('Toggle like error:', error)
          return Response.json({ message: 'Lỗi server' }, { status: 500 })
        }
      },
    },
  ],
}
