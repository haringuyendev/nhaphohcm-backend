// app/admin/post-property/[id]/page.tsx hoặc components/PostProperty.tsx
'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { uploadMedia } from "@/endpoints/common/media"
import { createProperty, updateProperty } from "@/endpoints/common/properties"
import { User } from "@/payload-types"
import { useRouter } from "next/navigation"
import MetaSEO from "./Form/MetaSEO"
import ContentSection from "./Form/ContentSection"
import InfoSection from "./Form/InfoSection"
import DemandSection from "./Form/DemandSection"
import AddressSection from "./Form/AddressSection"


const propertySchema = z.object({
    title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
    description: z.any(),
    province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    district: z.string().min(1, "Vui lòng chọn quận/huyện"),
    ward: z.string().optional(),
    address: z.string().min(5, "Địa chỉ cụ thể quá ngắn"),
    type: z.string().nonempty(),
    area: z.number().positive("Diện tích phải lớn hơn 0"),
    price: z.number().positive("Giá phải lớn hơn 0"),
    metaTitle:z.string().optional(),
    metaDescription:z.string().optional(),
    metaImage:z.any().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>
type PostPropertyProps = {
    user: User
    property?: any
}
export default function PostProperty({ user, property }: PostPropertyProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [titleLength, setTitleLength] = useState(0)
    const [isDemandOpen, setIsDemandOpen] = useState(true)
    const [isAddressOpen, setIsAddressOpen] = useState(true)
    const [isMainInfoOpen, setIsMainInfoOpen] = useState(true)
    const [isContentOpen, setIsContentOpen] = useState(true)
    // Thêm state này vào đầu component
    const [lexicalValue, setLexicalValue] = useState<any>(null)
    const [imageItems, setImageItems] = useState<{
        id: string
        url: string
        mediaId?: string
        file?: File          // ← THÊM DÒNG NÀY
        blurhash?: string
    }[]>([])
    const [metaImage, setMetaImage] = useState<{
        id: string
        url: string
        mediaId?: string
        file?: File          // ← THÊM DÒNG NÀY
        blurhash?: string
    }|null>(null)
    const [existingProperty, setExistingProperty] = useState<any>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        mode: "onChange",
    })

    useEffect(() => {
        if (!property) return

        const loadProperty = async () => {
            setExistingProperty(property)
            reset({
                title: property.title ?? "",
                province: String((property.province as any)?.id ?? ""),
                district: String((property.district as any)?.id ?? ""),
                ward: String((property.ward as any)?.id ?? ""),
                address: property.address ?? "",
                type: (property.type as any)?.id ?? "",
                area: Number(property.area ?? 0),
                price: Number(property.price ?? 0),
                metaTitle: property.meta?.title ?? "",
                metaDescription: property.meta?.description ?? "",
            })
            setIsLoading(false)
        }

        loadProperty()
    }, [property, reset])
    // 4. THAY TOÀN BỘ onSubmit → upload ảnh chỉ khi nhấn submit
    const onSubmit = async (data: PropertyFormData) => {
        if (imageItems.length === 0) {
            toast.error("Vui lòng tải lên ít nhất 1 ảnh")
            return
        }
        setUploading(true)
        try {
            // Bước 1: Upload tất cả ảnh mới (có file)
            const uploadPromises = imageItems
                .filter(item => item.file) // chỉ những ảnh chưa có mediaId
                .map(async (item) => {
                    const result = await uploadMedia(item.file!)
                    if (!result.success) throw new Error(`Upload thất bại: ${item.file!.name}`)
                    return result.id
                })
            const newUploadedIds = uploadPromises.length > 0
                ? await Promise.all(uploadPromises)
                : []
            const imagePayload = imageItems.map((item) => {
                if (item.file) {
                    const newMediaId = newUploadedIds.shift()
                    return { image: { id: newMediaId } }
                }
                return {
                    id: item.id,                    // ← rowId thật của array item
                    image: { id: item.mediaId },    // ← ĐÚNG ĐỊNH DẠNG MỚI!
                }
            })
            // Thêm ảnh mới còn dư
            newUploadedIds.forEach(id => imagePayload.push({ image: { id } }))

            // Nếu còn ảnh mới dư (hiếm xảy ra) → thêm vào cuối
            if (newUploadedIds.length > 0) {
                newUploadedIds.forEach(id => {
                    imagePayload.push({ image: { id } })
                })
            }

            let finalMetaImageId: string | undefined = undefined
            if (metaImage?.file) {
                const metaRes = await uploadMedia(metaImage.file)
                if (metaRes.success) finalMetaImageId = metaRes.id
            } else if (metaImage?.mediaId) {
                finalMetaImageId = metaImage.mediaId
            } else if (imageItems.length > 0) {
                // Fallback: dùng ảnh đầu tiên
                const first = imageItems[0]
                finalMetaImageId = first.mediaId || undefined
            }
            // Bước 4: Tạo payload
            const payloadData = {
                title: data.title,
                description: lexicalValue || data.description,
                type: data.type,
                price: Number(data.price),
                area: Number(data.area),
                province: data.province,
                district: data.district,
                ward: data.ward,
                address: data.address,
                images: imagePayload,                    // ← toàn bộ mediaId
                seller: user?.id,     // tùy bạn truyền user thế nào
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                metaImage: finalMetaImageId,
            }
            const result = property
                ? await updateProperty(property.id, payloadData)
                : await createProperty(payloadData)

            if (result.success) {
                toast.success(property ? "Cập nhật thành công!" : "Đăng tin thành công!")
                router.push('/dashboard')
            } else {
                toast.error(result.error || "Lỗi hệ thống")
            }
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Có lỗi xảy ra khi đăng tin")
        } finally {
            setUploading(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center">Đang tải tin đăng...</div>
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <h1 className="text-2xl font-bold mb-8">
                    {property ? "Chỉnh sửa tin đăng" : "Đăng tin mới"}
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <DemandSection isOpen={isDemandOpen} onOpenChange={setIsDemandOpen} />
                    <AddressSection
                        isOpen={isAddressOpen}
                        setIsOpen={setIsAddressOpen}
                        watch={watch}
                        setValue={setValue}
                        register={register}
                        errors={errors}
                        property={property}
                        onImagesChange={setImageItems}
                    />

                    <InfoSection
                        isOpen={isMainInfoOpen}
                        onOpenChange={setIsMainInfoOpen}
                        watch={watch}
                        setValue={setValue}
                        register={register}
                        property={property}
                        errors={errors}
                        existingPrice={existingProperty?.price}
                    />

                    <ContentSection
                        isOpen={isContentOpen}
                        onOpenChange={setIsContentOpen}
                        titleLength={titleLength}
                        setTitleLength={setTitleLength}
                        register={register}
                        errors={errors}
                        property={property}
                        lexicalValue={lexicalValue}
                        setLexicalValue={setLexicalValue}
                        setValue={setValue}
                    />

                    <MetaSEO property={property} watch={watch} setValue={setValue} onImageChange={setMetaImage}/>

                    {/* Nút bấm */}
                    <div className="flex gap-4 justify-end pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting || uploading}>
                            {property ? "Cập nhật tin" : "Đăng tin ngay"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}