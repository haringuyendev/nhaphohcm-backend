'use client'

import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { uploadMedia } from "@/endpoints/common/media"
import Image from "next/image"

type MetaSEOProps = {
  property?: any
  setValue: any
  watch: any
}

export default function MetaSEO({ property, setValue, watch }: MetaSEOProps) {
  const [isOpen, setIsOpen] = useState(false)

  const metaTitle = watch("meta.title") || property?.meta?.title || ""
  const metaDescription = watch("meta.description") || property?.meta?.description || ""
  const metaImage = watch("meta.image") || property?.meta?.image

  const handleUploadMetaImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được quá 5MB")
      return
    }

    try {
      const result = await uploadMedia(file)
      if (result.success) {
        setValue("meta.image", { id: result.id })
        toast.success("Đã chọn ảnh SEO thành công")
      }
    } catch (err) {
      toast.error("Upload ảnh thất bại")
    }
  }

  const removeMetaImage = () => {
    setValue("meta.image", null)
    toast.success("Đã xóa ảnh SEO")
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5 transition">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            SEO - Tối ưu công cụ tìm kiếm (khuyến khích điền)
          </h3>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-6">

            {/* Meta Title */}
            <div>
              <Label className="flex text-label items-center justify-between mb-2">
                <span>Tiêu đề SEO (Meta Title)</span>
                <span className="text-xs text-muted-foreground">
                  {metaTitle.length}/60 ký tự
                </span>
              </Label>
              <Input
                placeholder="Bán nhà 3 tầng 80m² Quận 7 - Full nội thất - Giá 4.5 tỷ"
                maxLength={60}
                defaultValue={property?.meta?.title}
                onChange={(e) => setValue("meta.title", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nên chứa từ khóa chính, hấp dẫn, dưới 60 ký tự để hiển thị đầy đủ trên Google
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <Label className="flex text-label items-center justify-between mb-2">
                <span>Mô tả SEO (Meta Description)</span>
                <span className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 ký tự
                </span>
              </Label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Bán nhà phố 3 tầng, diện tích 80m² tại Quận 7, TP.HCM. Gần Phú Mỹ Hưng, pháp lý rõ ràng, sổ hồng riêng. Liên hệ ngay để xem nhà!"
                maxLength={160}
                defaultValue={property?.meta?.description}
                onChange={(e) => setValue("meta.description", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hiển thị trên Google, nên hấp dẫn, có từ khóa, dưới 160 ký tự
              </p>
            </div>

            {/* Meta Image */}
            <div>
              <Label className="mb-2 text-label block">Ảnh đại diện khi chia sẻ (Facebook, Zalo)</Label>
              {metaImage ? (
                <div className="relative inline-block">
                  <Image
                    width={600}
                    height={300}
                    src={typeof metaImage === "object" ? metaImage.url : `/media/${metaImage}`}
                    alt="Meta SEO"
                    className="w-80 h-44 object-cover rounded-lg border shadow-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={removeMetaImage}
                  >
                    Xóa ảnh
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/10 transition bg-muted/20">
                  <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                  <span className="text-sm text-center px-4 text-muted-foreground">
                    Chọn ảnh SEO (tối ưu 1200×630px)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadMetaImage}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Kích thước lý tưởng: 1200×630px.
              </p>
            </div>

            {/* Live Preview */}
            <div className="border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/20">
              <p className="text-sm font-medium mb-3 text-blue-800 dark:text-blue-300">
                Xem trước trên Google:
              </p>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-400 line-clamp-1">
                  {metaTitle || property?.title || "Tiêu đề tin đăng của bạn..."}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  https://yourdomain.com/p/{property?.slug || "slug-tin-dang"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {metaDescription || "Mô tả ngắn gọn, hấp dẫn về bất động sản của bạn sẽ hiện ở đây khi tìm kiếm trên Google..."}
                </p>
              </div>
            </div>

          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}