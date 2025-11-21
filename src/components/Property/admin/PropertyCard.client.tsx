'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  bumpProperty,
  restoreProperty,
  softDeleteProperty,
  togglePublish,
  updateVipStatus,
} from '@/endpoints/common/properties'
import { Upload, Download, Trash2, Undo2, Diamond, MoreVertical } from 'lucide-react'
import { Property } from '@/payload-types'
import { formatPrice, getMediaBlurUrl, getMediaUrl, getValue } from '@/lib/utils'

export default function PropertyCard({ property }: { property: Property }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isMobile = useIsMobile()

  const isExpired = property.expire_at ? new Date(property.expire_at) < new Date() : false

  const getStatus = () => {
    if (property.is_hidden) return { label: 'Đã xóa', color: 'bg-gray-200 text-gray-700' }
    if (isExpired) return { label: 'Hết hạn', color: 'bg-red-100 text-red-700' }
    if (!property.is_published) return { label: 'Đã hạ', color: 'bg-orange-100 text-orange-700' }
    const diff = property.expire_at
      ? Math.floor((new Date(property.expire_at).getTime() - Date.now()) / 86400000)
      : null
    if (diff !== null && diff <= 3 && diff >= 0)
      return { label: 'Sắp hết hạn', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Đang hiển thị', color: 'bg-green-100 text-green-700' }
  }

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    startTransition(async () => {
      const res = await action()
      if (res.success) {
        toast.success(successMsg)
        router.refresh()
      } else {
        toast.error(res.error || 'Lỗi')
      }
    })
  }

  const handleBump = () => {
    const now = Date.now()
    const last = property.last_bumped_at ? new Date(property.last_bumped_at).getTime() : 0
    if (last && now - last < 8 * 3600000) {
      const h = Math.ceil((8 * 3600000 - (now - last)) / 3600000)
      toast.warning(`Chờ ${h} giờ nữa`)
      return
    }
    handleAction(() => bumpProperty(property.id), 'Tin đã được đẩy lên!')
  }

  const handleVip = () => {
    const now = Date.now()
    const act = property.vip_activated_at ? new Date(property.vip_activated_at).getTime() : 0
    if (act && now - act < 8 * 3600000) {
      const h = Math.ceil((8 * 3600000 - (now - act)) / 3600000)
      toast.warning(`VIP chờ ${h} giờ`)
      return
    }
    handleAction(() => updateVipStatus(property.id, 7, true), 'Tin đã lên VIP 7 ngày!')
  }

  const ActionButtons = () => (
    <div className="flex flex-wrap gap-1 mt-2">
      {/* Đẩy tin */}
      {!property.is_hidden && property.is_published && !isExpired && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2.5 h-8"
          onClick={(e) => {
            e.stopPropagation()
            handleBump()
          }}
          disabled={isPending}
        >
          <Upload className="w-3.5 h-3.5 mr-1" /> Đẩy
        </Button>
      )}

      {/* VIP */}
      {!property.is_hidden && property.is_published && !isExpired && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2.5 h-8"
          onClick={(e) => {
            e.stopPropagation()
            handleVip()
          }}
          disabled={isPending}
        >
          <Diamond className="w-3.5 h-3.5 mr-1" /> VIP
        </Button>
      )}

      {/* Hạ / Đăng lại */}
      {!property.is_hidden && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2.5 h-8"
          onClick={(e) => {
            e.stopPropagation()
            handleAction(
              () => togglePublish(property.id, property.is_published || false),
              property.is_published ? 'Tin đã hạ' : 'Tin đã đăng lại'
            )
          }}
          disabled={isPending}
        >
          {property.is_published && !isExpired ? (
            <> <Download className="w-3.5 h-3.5 mr-1" /> Hạ </>
          ) : (
            <> <Upload className="w-3.5 h-3.5 mr-1" /> Lên </>
          )}
        </Button>
      )}

      {/* Xóa / Khôi phục */}
      {!property.is_hidden ? (
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2.5 h-8 text-destructive border-destructive"
          onClick={(e) => {
            e.stopPropagation()
            handleAction(() => softDeleteProperty(property.id), 'Tin đã vào thùng rác')
          }}
          disabled={isPending}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2.5 h-8"
          onClick={(e) => {
            e.stopPropagation()
            handleAction(() => restoreProperty(property.id), 'Tin đã được khôi phục')
          }}
          disabled={isPending}
        >
          <Undo2 className="w-3.5 h-3.5 mr-1" /> Khôi phục
        </Button>
      )}
    </div>
  )

  // === DESKTOP: NÚT NGANG TRONG FOOTER ===
  const DesktopFooterActions = () => (
    <div className="flex flex-wrap gap-2">
      {!property.is_hidden && property.is_published && !isExpired && (
        <>
          <Button variant="outline" size="sm" onClick={handleBump} disabled={isPending}>
            <Upload className="w-4 h-4 mr-1" /> Đẩy tin
          </Button>
          <Button variant="outline" size="sm" onClick={handleVip} disabled={isPending}>
            <Diamond className="w-4 h-4 mr-1" /> VIP 7 ngày
          </Button>
        </>
      )}
      {!property.is_hidden && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleAction(
              () => togglePublish(property.id, property.is_published || false),
              property.is_published ? 'Tin đã hạ' : 'Tin đã đăng lại'
            )
          }
          disabled={isPending}
        >
          {property.is_published && !isExpired ? (
            <> <Download className="w-4 h-4 mr-1" /> Hạ tin </>
          ) : (
            <> <Upload className="w-4 h-4 mr-1" /> Đăng lại </>
          )}
        </Button>
      )}
      {!property.is_hidden ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction(() => softDeleteProperty(property.id), 'Tin đã vào thùng rác')}
          className="text-destructive border-destructive"
          disabled={isPending}
        >
          <Trash2 className="w-4 h-4 mr-1" /> Xóa
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction(() => restoreProperty(property.id), 'Tin đã được khôi phục')}
          disabled={isPending}
        >
          <Undo2 className="w-4 h-4 mr-1" /> Khôi phục
        </Button>
      )}
    </div>
  )

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* === MOBILE: ẢNH TRÊN, INFO DƯỚI === */}
      {isMobile ? (
        <>
          <div className="relative w-full h-60 overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={getMediaUrl(property.images?.[0]?.image) || '/placeholder.jpg'}
              alt={property.title || 'Bất động sản'}
              width={800}
              height={500}
              className="w-full h-full object-cover"
              priority
              placeholder="blur"
              blurDataURL={getMediaBlurUrl(property.images?.[0]?.image) || ""} // optional
            />

            {property.is_vip && (
              <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                VIP
              </div>
            )}

          </div>

          {/* Info */}
          <CardContent
            className="p-4 cursor-pointer"
            onClick={() => router.push(`/dashboard/${property.id}`)}
          >
            <div className="flex items-center mb-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatus().color}`}>
                {getStatus().label}
              </span>
            </div>
            <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary">
              {property.title}
            </h3>
            <p className="text-lg font-bold text-accent mb-1">
              {formatPrice(property.price)}
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
              <span>{property.area} m²</span>
              {property.bedrooms && <span>• {property.bedrooms} PN</span>}
              {property.bathrooms && <span>• {property.bathrooms} PT</span>}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {[property.address, getValue(property.ward, 'name'), getValue(property.district, 'name'), getValue(property.province, 'name')]
                .filter(Boolean)
                .join(', ')}
            </p>
          </CardContent>

          {/* Footer: Nút nhanh + 3 chấm */}
          <CardFooter className="p-3 pt-0 border-t bg-muted/30">
            <ActionButtons />
          </CardFooter>
        </>
      ) : (
        /* === DESKTOP: NGANG, NÚT ĐẦY ĐỦ === */
        <div className="p-4">
          <div className="flex gap-4">
            {/* Ảnh */}
            <div className="relative flex-shrink-0 w-32 h-32">
              <Image
                src={getMediaUrl(property.images?.[0]?.image)}
                alt={property.title}
                fill
                className="object-cover rounded-lg"
                sizes="128px"
                priority
                blurDataURL={getMediaBlurUrl(property.images?.[0]?.image) || ""}
              />
              {property.is_vip && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  VIP
                </div>
              )}
            </div>

            {/* Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer group"
              onClick={() => router.push(`/dashboard/${property.id}`)}
            >
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary line-clamp-2">
                {property.title}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatus().color}`}>
                  {getStatus().label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-1">
                <span className="text-accent font-semibold text-base">
                  {formatPrice(property.price)}
                </span>
                <span>· {property.area} m²</span>
                {property.bedrooms && <span>· {property.bedrooms} PN</span>}
                {property.bathrooms && <span>· {property.bathrooms} PT</span>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {property.address},{' '}
                {[getValue(property.ward, 'name'), getValue(property.district, 'name'), getValue(property.province, 'name')]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>

            {/* Nút hành động ngang */}
            <div className="flex items-start">
              <DesktopFooterActions />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

