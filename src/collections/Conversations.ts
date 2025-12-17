import { adminOnly } from '@/access/adminOnly'
import { adminOrParticipants } from '@/access/adminOrParticipants'
import { Message } from '@/payload-types'
import { sendExpoPush } from '@/utilities/sendNotify'
import { CollectionConfig, User } from 'payload'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  auth: false,
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: adminOrParticipants,
    create: adminOrParticipants,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: false,
    },
    {
      name: 'isGroup',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'participantsKey',
      type: 'text',
      unique: true,
      admin: {
        condition: ({ isGroup }) => !isGroup,
      },
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'lastMessage',
      type: 'relationship',
      relationTo: 'messages',
    },
  ],
  endpoints: [
    {
      path: '/create-or-get',
      method: 'post',
      handler: async (req) => {
        try {
          // Check req
          if (!req) {
            return Response.json({ error: 'Lỗi hệ thống' }, { status: 500 })
          }

          // Check user JWT
          const user = req.user
          if (!user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          // Parse JSON body safely
          let data
          try {
            data = await req.json?.()
          } catch (e) {
            return Response.json({ error: 'Invalid JSON' }, { status: 400 })
          }

          const { sender, recipient } = data ?? {}

          if (!sender || !recipient) {
            return Response.json({ error: 'Missing sender/recipient' }, { status: 400 })
          }

          // Build participants key
          const participants = [sender, recipient].sort()
          const participantsKey = participants.join('_')

          // Check existing conversation
          const existing = await req.payload.find({
            collection: 'conversations',
            where: {
              participantsKey: {
                equals: participantsKey,
              },
            },
            depth: 2,
          })

          if (existing.docs.length > 0) {
            return Response.json(existing.docs[0])
          }

          // Create new conversation
          const conv = await req.payload.create({
            collection: 'conversations',
            data: {
              participants,
              participantsKey,
              title: 'Đoạn chat mới',
            },
          })

          // Fetch again with depth để gửi về đủ data
          const populated = await req.payload.find({
            collection: 'conversations',
            where: { id: { equals: conv.id } },
            depth: 2,
          })

          return Response.json(populated.docs[0])
        } catch (err) {
          console.error('❌ Create-or-get conversation error:', err)
          return Response.json({ error: 'Server error' }, { status: 500 })
        }
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create') return

        const io = req.payload?.io // <-- LẤY IO TỪ PAYLOAD (ta thêm ở plugin)
        if (!io) return doc

        console.log('🚀 ~ afterChange ~ io:')
        // Lấy conversation đã populate
        const populated = await req.payload.find({
          collection: 'conversations',
          where: { id: { equals: doc.id } },
          depth: 2,
        })

        const conversation = populated.docs[0]
        const sender = (conversation?.lastMessage as Message)?.sender as any

        // Emit cập nhật conversation đến từng user
        const participants = conversation?.participants ?? []

        for (const user of participants) {
          const userId = (user as any).id

          // Emit tương tự
          io.to(`user_${userId}`).emit('COLLECTION_CHANGED', {
            collection: 'conversations',
            operation: 'update',
            doc: conversation,
          })
          if (userId !== sender.id) {
            // 🔥 Push notification nếu có token
            const pushToken = (user as any).expoPushToken

            if (pushToken) {
              console.log('📨 Sending push to:', pushToken)

              const text = (conversation?.lastMessage as Message)?.text || 'Bạn có tin nhắn mới'

              await sendExpoPush(
                pushToken,
                conversation.isGroup ? conversation.title : (sender as any).name || 'Tin nhắn mới',
                text,
              )
            }
          }
        }

        return doc
      },
    ],
  },
}
