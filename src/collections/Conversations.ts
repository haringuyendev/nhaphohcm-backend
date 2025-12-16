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
        const message = populated.docs[0]
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

          // 🔥 Push notification nếu có token
          const pushToken = (user as any).expoPushToken

          // Không gửi cho chính người gửi
          const senderId = ((conversation?.lastMessage as Message)?.sender as any)?.id
          if (userId === senderId) continue

          if (pushToken) {
            console.log('📨 Sending push to:', pushToken)

            const text = (conversation?.lastMessage as Message)?.text || 'Bạn có tin nhắn mới'

            const res=await sendExpoPush(pushToken, conversation.title || 'Tin nhắn mới', text)
            console.log(res)
          }
        }

        return doc
      },
    ],
  },
}
