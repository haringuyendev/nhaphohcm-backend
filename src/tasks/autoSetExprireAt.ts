// src/jobs/AutoSetExpireAt.ts
import { TaskConfig } from 'payload'

export const AutoSetExpireAt: TaskConfig = {
  slug: 'autoSetExpireAt',
  retries: 3,
  schedule: [
    {
      cron: '*/2 * * * *',
      queue: 'set_expire_at',
    },
  ],
  inputSchema: [],
  handler: async ({ req }) => {
    const { payload } = req
    const nowISO = new Date().toISOString()
    console.log('AutoSetExpireAt: Bắt đầu kiểm tra tin chưa có expire_at...', nowISO)

    // Tìm các tin chưa có expire_at HOẶC expire_at bị null/empty
    const { docs: propertiesWithoutExpire } = await payload.find({
      collection: 'properties',
      where: {
        or: [
          { expire_at: { exists: false } },
          { expire_at: { equals: null } },
          { expire_at: { equals: '' } },
        ],
      },
      limit: 0,
      pagination: false,
    })

    if (propertiesWithoutExpire.length === 0) {
      console.log('Tất cả tin đã có expire_at')
      return { output: { updatedCount: 0 } }
    }

    console.log(`Phát hiện ${propertiesWithoutExpire.length} tin chưa có expire_at → đang gán...`)

    let updatedCount = 0
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000 // 30 ngày

    await Promise.all(
      propertiesWithoutExpire.map(async (prop) => {
        try {
          // Dùng createdAt làm mốc, nếu không có thì dùng hôm nay
          const baseDate = prop.createdAt ? new Date(prop.createdAt) : new Date()
          const expireDate = new Date(baseDate.getTime() + thirtyDaysInMs)

          await payload.update({
            collection: 'properties',
            id: prop.id,
            data: {
              expire_at: expireDate.toISOString(),
            },
          })

          updatedCount++
          console.log(`Đã gán expire_at cho tin ${prop.id}: ${expireDate.toISOString().split('T')[0]}`)
        } catch (err) {
          console.error(`Lỗi gán expire_at cho tin ${prop.id}:`, err)
        }
      })
    )

    console.log(`HOÀN TẤT! Đã gán expire_at cho ${updatedCount} tin (created_at + 30 ngày)`)

    return {
      output: {
        updatedCount,
        message: `${updatedCount} tin được gán expire_at = created_at + 30 ngày`,
      },
    }
  },
}