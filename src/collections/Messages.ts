import { adminOnly } from '@/access/adminOnly'
import { adminOrParticipants } from '@/access/adminOrParticipants'
import { checkRole } from '@/access/utilities'
import { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  auth: false,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false

      if (checkRole(['admin'], user)) return true

      return {
        'conversation.participants': {
          contains: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false

      if (checkRole(['admin'], user)) return true

      return false
    },
    update: adminOnly,
    delete: adminOnly,
  },
  timestamps: true,
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'isReadBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
  ],
  hooks: {
    afterChange: [
      // args: { req, doc, previousDoc, operation }
      async ({ req, doc, previousDoc }) => {
        try {
          const io = req.payload?.io
          // Nếu không có io (ví dụ trong môi trường không bật plugin socket) thì vẫn trả về doc
          if (!io) return doc

          // Lấy message đã populate sender + conversation (và participants)
          const populated = await req.payload.find({
            collection: 'messages',
            where: { id: { equals: doc.id } },
            depth: 2, // sender + conversation + conversation.participants
          })

          const message = populated.docs[0]
          if (!message) return doc

          // Cập nhật lastMessage trên conversation nếu message mới hoặc text/attachment thay đổi
          // (Bạn có thể kiểm tra previousDoc để chỉ cập nhật khi cần)
          const conv=(message.conversation as any).id ?? message.conversation
          console.log('Conversation ID:', conv);
          await req.payload.update({
            collection: 'conversations',
            id: (message.conversation as any).id ?? message.conversation,
            data: {
              lastMessage: message.id,
              updatedAt: new Date().toISOString(),
            },
            // tránh trigger vòng lặp hooks nếu cần thiết bằng cách set noValidate / overrideAccess tùy case
          })

          // Chuẩn bị payload gửi realtime
          const payload = {
            id: message.id,
            conversation: message.conversation,
            sender: message.sender,
            text: message.text,
            attachments: message.attachments ?? [],
            isReadBy: message.isReadBy ?? [],
          }

          // Nếu có participants trong conversation, gửi tới mỗi user (và room conversation)
          const participants = (message.conversation as any)?.participants
          if (Array.isArray(participants) && participants.length) {
            // Emit đến room conversation nếu bạn có join theo conversation
            const convId = (message.conversation as any).id ?? message.conversation
            // Emit đến từng user socket (ví dụ join theo user_{id})
            participants.forEach((p: any) => {
              const userId = p?.id ?? p
              if (!userId) return
              io.to(`user_${userId}`).emit('COLLECTION_CHANGED', {
                collection: 'messages',
                operation: 'update',
                doc: payload,
              })
            })
          }

          // Nếu có thay đổi trường isReadBy => emit MESSAGE_READ cho sender (hoặc tất cả participants)
          const prevRead = Array.isArray(previousDoc?.isReadBy)
            ? previousDoc.isReadBy.map((r: any) => r.id ?? r)
            : []
          const currRead = Array.isArray(doc.isReadBy)
            ? doc.isReadBy.map((r: any) => r.id ?? r)
            : []
          // Nếu có user mới đọc:
          const newlyReadBy = currRead.filter((id: any) => !prevRead.includes(id))
          if (newlyReadBy.length) {
            newlyReadBy.forEach((readerId: any) => {
              // notify sender that readerId đã đọc
              const senderId = (message.sender as any)?.id ?? message.sender
              if (senderId) {
                io.to(`user_${senderId}`).emit('COLLECTION_CHANGED', {
                  collection: 'messages',
                  operation: 'update',
                  doc: {
                    id: message.id,
                    conversationId: (message.conversation as any).id ?? message.conversation,
                    readerId,
                    readAt: new Date().toISOString(),
                  },
                })
              }
            })
          }

          return doc
        } catch (err) {
          // Không nên ném lỗi (có thể làm fail request) — log và vẫn return doc
          console.error('afterChange messages hook error:', err)
          return doc
        }
      },
    ],
  },
}
