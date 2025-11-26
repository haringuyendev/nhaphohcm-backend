import { TaskConfig } from 'payload'

export const AutoExpireProperties: TaskConfig = {
  slug: 'autoExpireProperties',
  retries: 3,
  schedule: [
    {
      cron: '0 */4 * * *',
      queue: 'exprire_property',
    },
  ],
  inputSchema: [], // Không cần input
  handler: async ({ req }) => {
    const { payload } = req
    const nowISO = new Date().toISOString()
    console.log('Cron chạy lúc:', nowISO)

    // 1. Tìm các tin cần xử lý (3 trường hợp)
    const { docs: propertiesToProcess } = await payload.find({
      collection: 'properties',
      where: {
        or: [
          // Trường hợp 1: Tin hết hạn (expire_at)
          {
            and: [
              { expire_at: { exists: true } },
              { expire_at: { less_than: nowISO } },
              { is_published: { equals: true } },
            ],
          },
          // Trường hợp 2: VIP hết hạn (vip_expire_at) nhưng vẫn is_vip = true
          {
            and: [
              { vip_expire_at: { exists: true } },
              { vip_expire_at: { less_than: nowISO } },
              { is_vip: { equals: true } },
            ],
          },
          // Trường hợp 3: Cả 2 đều hết hạn (tối ưu hóa)
          {
            and: [
              { expire_at: { exists: true } },
              { expire_at: { less_than: nowISO } },
              { vip_expire_at: { exists: true } },
              { vip_expire_at: { less_than: nowISO } },
            ],
          },
        ],
      },
      limit: 0,
      pagination: false,
    })

    if (propertiesToProcess.length === 0) {
      console.log('Không có tin nào cần xử lý hôm nay')
      return { output: { expiredCount: 0, vipExpiredCount: 0 } }
    }

    console.log(`Phát hiện ${propertiesToProcess.length} tin cần xử lý...`)

    // Phân loại và xử lý riêng biệt
    let expiredCount = 0
    let vipExpiredCount = 0

    await Promise.all(
      propertiesToProcess.map(async (prop) => {
        const shouldHide = prop.expire_at && prop.expire_at < nowISO
        const shouldRemoveVip = prop.vip_expire_at && prop.vip_expire_at < nowISO

        // Chỉ update khi có thay đổi
        if (!shouldHide && !shouldRemoveVip) return

        const updateData: any = {}

        if (shouldHide) {
          updateData.is_published = false
          expiredCount++
        }
        if (shouldRemoveVip) {
          updateData.is_vip = false
          vipExpiredCount++
        }

        try {
          await payload.update({
            collection: 'properties',
            id: prop.id,
            data: updateData,
          })
        } catch (err) {
          console.error(`Lỗi xử lý tin ${prop.id}:`, err)
        }
      }),
    )

    console.log(`HOÀN TẤT!`)
    if (expiredCount > 0) console.log(`→ Ẩn tin: ${expiredCount} tin (hết hạn expire_at)`)
    if (vipExpiredCount > 0) console.log(`→ Bỏ VIP: ${vipExpiredCount} tin (hết hạn vip_expire_at)`)

    return {
      output: {
        totalProcessed: propertiesToProcess.length,
        expiredCount,
        vipExpiredCount,
      },
    }
  },
}
