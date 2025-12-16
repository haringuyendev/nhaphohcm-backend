'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

interface Property {
  id: string
  is_hidden?: boolean
  is_published?: boolean
  is_vip?: boolean
  expire_at?: string
  last_bumped_at?: string
  vip_activated_at?: string
}

interface PropertyListClientProps {
  children: React.ReactNode
  currentStatus?: string
}

export default function PropertyListClient({ children, currentStatus }: PropertyListClientProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const stats = {
    total: 100,
    published: 40,
    unpublished: 30,
    deleted: 15,
    expired: 10,
    expiring: 5,
  } // ← Sẽ được thay bằng dữ liệu thật từ server

  const filters = [
    { key: undefined, label: 'Tất cả', count: stats.total },
    { key: 'published', label: 'Đang hiển thị', count: stats.published },
    { key: 'unpublished', label: 'Đã hạ', count: stats.unpublished },
    { key: 'deleted', label: 'Đã xóa', count: stats.deleted },
    { key: 'expired', label: 'Hết hạn', count: stats.expired },
    { key: 'expiring', label: 'Sắp hết hạn', count: stats.expiring },
  ]

  const refetch = () => {
    startTransition(() => router.refresh())
  }

  const handleAction = async (
    action: () => Promise<any>,
    successMsg: string,
    errorMsg = 'Lỗi'
  ) => {
    const res = await action()
    if (res.success) {
      toast.success(successMsg)
      refetch()
    } else {
      toast.error(res.error || errorMsg)
    }
  }

  return (
    <div className='container mx-auto px-2'>
      {children}
    </div>      
  )
}