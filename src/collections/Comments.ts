// collections/comments.ts
import { CollectionConfig } from 'payload'
async function syncCommentCount(payload: any, postId: string | { id: string }) {
  const id = typeof postId === 'object' ? postId.id : postId

  if (!id) return

  try {
    // Đếm số comment KHÔNG bị ẩn (tùy chọn: chỉ active/public)
    const { totalDocs } = await payload.find({
      collection: 'comments',
      where: {
        post: { equals: id },
        // Nếu muốn ẩn comment bị ẩn hoặc bị report:
        // isHidden: { equals: false },
      },
      limit: 0,
      pagination: false,
    })

    // Cập nhật commentCount trên socialPosts
    await payload.update({
      collection: 'socialPosts',
      id,
      data: { commentCount: totalDocs },
    })
  } catch (error) {
    console.error('Failed to sync commentCount for post:', id, error)
  }
}
export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    read: () => true,
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
    { name: 'text', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      filterOptions: ({ siblingData, id }) => {
        if (!id) return true
        return { id: { not_equals: id } }
      },
    },
    {
      name: 'isHidden',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Ẩn bình luận (moderator/admin)' },
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

    // === THÊM: Đồng bộ commentCount ===
    afterChange: [
      async ({ doc, req, operation }) => {
        // Cập nhật count khi tạo hoặc update (nếu có thay đổi isHidden)
        await syncCommentCount(req.payload, doc.post)

        // Real-time emit (giữ nguyên)
        const io = (req.payload as any).io
        if (io && doc.post) {
          const postId = typeof doc.post === 'object' ? doc.post.id : doc.post
          io.to(`post_${postId}`).emit('comment:changed', doc)
        }

        return doc
      },
    ],

    afterDelete: [
      async ({ doc, req }) => {
        // Cập nhật count khi xóa comment
        await syncCommentCount(req.payload, doc.post)

        // Optional: emit event xóa comment
        const io = (req.payload as any).io
        if (io && doc.post) {
          const postId = typeof doc.post === 'object' ? doc.post.id : doc.post
          io.to(`post_${postId}`).emit('comment:deleted', { commentId: doc.id })
        }

        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/add',
      method: 'post',
      handler: async (req) => {
        const user = req.user
        if (!user) {
          return Response.json({ message: 'Yêu cầu đăng nhập' }, { status: 401 })
        }

        if (!req.json) {
          return Response.json({ message: 'Yêu cầu dữ liệu JSON' }, { status: 400 })
        }

        const body = await req.json()
        const { post: postId, text } = body

        if (!postId || !text?.trim()) {
          return Response.json(
            { message: 'Thiếu post ID hoặc nội dung bình luận' },
            { status: 400 },
          )
        }

        if (text.trim().length > 1000) {
          return Response.json(
            { message: 'Bình luận quá dài (tối đa 1000 ký tự)' },
            { status: 400 },
          )
        }

        try {
          // Kiểm tra quyền comment (tái sử dụng logic access.create)
          const post = await req.payload.findByID({
            collection: 'socialPosts',
            id: postId,
            depth: 0,
          })

          if (!post) {
            return Response.json({ message: 'Bài viết không tồn tại' }, { status: 404 })
          }

          const member = await req.payload.find({
            collection: 'members',
            where: {
              community: { equals: post.community },
              user: { equals: user.id },
              status: { equals: 'active' },
            },
            limit: 1,
          })

          if (member.totalDocs === 0 && !user.roles?.includes('admin')) {
            return Response.json(
              { message: 'Bạn không phải thành viên cộng đồng này' },
              { status: 403 },
            )
          }

          // Tạo comment
          const newComment = await req.payload.create({
            collection: 'comments',
            data: {
              post: postId,
              text: text.trim(),
              author: user.id,
              parentComment: null, // comment chính
            },
            depth: 3, // populate author, post, etc.
          })

          return Response.json({
            success: true,
            comment: newComment,
          })
        } catch (error: any) {
          console.error('Add comment error:', error)
          return Response.json({ message: 'Lỗi khi thêm bình luận' }, { status: 500 })
        }
      },
    },

    {
      path: '/reply',
      method: 'post',
      handler: async (req) => {
        const user = req.user
        if (!user) {
          return Response.json({ message: 'Yêu cầu đăng nhập' }, { status: 401 })
        }

        if (!req.json) {
          return Response.json({ message: 'Yêu cầu dữ liệu JSON' }, { status: 400 })
        }

        const body = await req.json()
        const { parentComment: parentId, text } = body

        if (!parentId || !text?.trim()) {
          return Response.json(
            { message: 'Thiếu ID comment cha hoặc nội dung reply' },
            { status: 400 },
          )
        }

        if (text.trim().length > 1000) {
          return Response.json({ message: 'Reply quá dài (tối đa 1000 ký tự)' }, { status: 400 })
        }

        try {
          // Lấy comment cha để lấy postId và kiểm quyền
          const parentComment = await req.payload.findByID({
            collection: 'comments',
            id: parentId,
            depth: 2,
          })

          if (!parentComment) {
            return Response.json({ message: 'Bình luận cha không tồn tại' }, { status: 404 })
          }

          const postId =
            typeof parentComment.post === 'object' ? parentComment.post.id : parentComment.post

          // Kiểm tra quyền (giống add comment)
          const member = await req.payload.find({
            collection: 'members',
            where: {
              community: { equals: (parentComment.post as any)?.community || postId },
              user: { equals: user.id },
              status: { equals: 'active' },
            },
            limit: 1,
          })

          if (member.totalDocs === 0 && !user.roles?.includes('admin')) {
            return Response.json(
              { message: 'Bạn không được phép trả lời trong cộng đồng này' },
              { status: 403 },
            )
          }

          // Tạo reply
          const replyComment = await req.payload.create({
            collection: 'comments',
            data: {
              post: postId,
              text: text.trim(),
              author: user.id,
              parentComment: parentId,
            },
            depth: 3,
          })

          return Response.json({
            success: true,
            comment: replyComment,
          })
        } catch (error: any) {
          console.error('Reply comment error:', error)
          return Response.json({ message: 'Lỗi khi trả lời bình luận' }, { status: 500 })
        }
      },
    },
    {
      path: '/post/:postId',
      method: 'get',
      handler: async (req: any) => {
        const { postId } = req.routeParams || req.params
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

        if (!postId) {
          return Response.json({ message: 'Thiếu postId' }, { status: 400 })
        }

        try {
          // Kiểm tra post có tồn tại không (tùy chọn nhưng tốt)
          const postExists = await req.payload
            .findByID({
              collection: 'socialPosts',
              id: postId,
              depth: 0,
            })
            .catch(() => null)

          if (!postExists) {
            return Response.json({ message: 'Bài viết không tồn tại' }, { status: 404 })
          }

          // Lấy tất cả comment của post (bao gồm reply)
          const result = await req.payload.find({
            collection: 'comments',
            where: {
              post: { equals: postId },
              // Có thể thêm: isHidden: { equals: false } nếu muốn ẩn comment bị ẩn
            },
            depth: 4, // populate sâu: author (với avatar), parentComment, post...
            sort: '-createdAt', // comment mới nhất lên đầu
            page,
            limit,
            req,
          })

          // Nếu bạn muốn cấu trúc dạng cây (nested replies), có thể xử lý ở đây
          // Nhưng với depth populate tốt + frontend xử lý thì trả phẳng là ổn và hiệu quả hơn

          return Response.json({
            ...result,
            postId,
          })
        } catch (error: any) {
          console.error('Error fetching comments for post:', postId, error)
          return Response.json({ message: 'Lỗi khi lấy bình luận' }, { status: 500 })
        }
      },
    },

    // Nếu muốn thêm: Lấy số lượng comment của post (cho badge)
    {
      path: '/post/:postId/count',
      method: 'get',
      handler: async (req: any) => {
        const { postId } = req.routeParams || req.params

        if (!postId) {
          return Response.json({ message: 'Thiếu postId' }, { status: 400 })
        }

        try {
          const { totalDocs } = await req.payload.find({
            collection: 'comments',
            where: { post: { equals: postId } },
            limit: 0,
            pagination: false,
          })

          return Response.json({ count: totalDocs })
        } catch (error) {
          return Response.json({ count: 0 })
        }
      },
    },
  ],
}
