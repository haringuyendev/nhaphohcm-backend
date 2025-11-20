// app/admin/post-property/[id]/page.tsx hoặc components/PostProperty.tsx
'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles, Upload } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import Link from "next/link"
import { uploadMedia } from "@/endpoints/common/media"
import { createProperty, updateProperty } from "@/endpoints/common/properties"
import { SortableImage } from "@/components/Property/admin/Create/SortableImage"
import PriceInput from "@/components/Property/admin/Create/PriceInput"
import LexicalEditor from "@/components/Property/admin/Create/RichtextEditor"
import { Property, User } from "@/payload-types"
import { useProvinces } from "@/hooks/useProvinces"
import { useDistricts } from "@/hooks/use-districts"
import { useWards } from "@/hooks/use-wards"
import { usePropertyTypes } from "@/hooks/use-property_types"
import { useRouter } from "next/navigation"


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
})

type PropertyFormData = z.infer<typeof propertySchema>
type PostPropertyProps = {
    user: User
    property?: any
}
export default function PostProperty({ user, property }: PostPropertyProps) {

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [titleLength, setTitleLength] = useState(0)
    const [descriptionLength, setDescriptionLength] = useState(0)
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
    }[]>([])
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

    const provinces = useProvinces()
    const districts = useDistricts(Number(watch("province")))
    const wards = useWards(Number(watch("district")))
    const propertyTypes = usePropertyTypes()
    console.log("Property", property)
    console.log("imageItems", imageItems)
    useEffect(() => {
        if (!property) return

        const loadProperty = async () => {
            setExistingProperty(property)

            // Reset form – dùng optional chaining + default value
            reset({
                title: property.title ?? "",
                province: String((property.province as any)?.code ?? ""),
                district: String((property.district as any)?.code ?? ""),
                ward: String((property.ward as any)?.code ?? ""),
                address: property.address ?? "",
                type: (property.type as any)?.value ?? String(property.type ?? ""),
                area: Number(property.area ?? 0),
                price: Number(property.price ?? 0),
            })

            setLexicalValue(property.description)

            // Load ảnh – ép kiểu rõ ràng, tránh deep type inference
            const existingImages = (property.images as any[] | undefined ?? [])
                .map((img: any) => ({
                    id: img.id, // ĐÃ ĐÚNG RỒI – giữ nguyên
                    url: img.image?.url
                        ? `${process.env.NEXT_PUBLIC_SERVER_URL}${img.image.url.startsWith('/') ? '' : '/'}${img.image.url}`
                        : `${process.env.NEXT_PUBLIC_SERVER_URL}/media/${img.image?.filename || img.image}`,
                    mediaId: (img.image?.id || img.image) as string,
                }))
            setImageItems(existingImages)

            // Cập nhật độ dài (an toàn)
            setTitleLength(property.title?.length || 0)

            setIsLoading(false)
        }

        loadProperty()
    }, [property, reset])

    // 2. THAY TOÀN BỘ handleImageUpload → chỉ tạo preview, không upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const remaining = 6 - imageItems.length
        if (remaining <= 0) {
            toast.error("Chỉ được chọn tối đa 6 ảnh")
            return
        }

        const newFiles = Array.from(files).slice(0, remaining)

        const newItems = newFiles.map(file => ({
            id: `pending-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            file: file,                    // ← lưu lại File để upload sau
        }))

        setImageItems(prev => [...prev, ...newItems])
        toast.success(`Đã chọn ${newFiles.length} ảnh (sẽ upload khi đăng tin)`)
    }

    // 3. SỬA handleRemoveImage → thu hồi blob URL
    const handleRemoveImage = (id: string) => {
        setImageItems(prev => {
            const removed = prev.find(i => i.id === id)
            if (removed?.url.startsWith("blob:")) {
                URL.revokeObjectURL(removed.url)
            }
            return prev.filter(i => i.id !== id)
        })
    }

    // Kéo thả
    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setImageItems(items => {
            const oldIndex = items.findIndex(i => i.id === active.id)
            const newIndex = items.findIndex(i => i.id === over.id)
            return arrayMove(items, oldIndex, newIndex)
        })
    }

    // Submit form
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

            // Bước 3: Tìm ID thật của tỉnh/huyện/xã (giữ nguyên logic cũ của bạn)
            const wardCodeStr = String(data.ward || "").trim()
            const districtCodeStr = String(data.district).trim()
            const provinceCodeStr = String(data.province).trim()

            const wardMatch = data.ward ? wards.find(w => String(w.value).trim() === wardCodeStr) : null
            const districtMatch = districts.find(d => String(d.value) === districtCodeStr)
            const provinceMatch = provinces.find(p => String(p.value) === provinceCodeStr)
            const typeMatch = propertyTypes.find(t => String(t.value) === data.type)
            if (!districtMatch || !provinceMatch || !typeMatch) {
                toast.error("Quận/huyện hoặc tỉnh/thành không hợp lệ")
                return
            }

            // Bước 4: Tạo payload
            const payloadData = {
                title: data.title,
                description: JSON.stringify(data.description),
                type: typeMatch.id,
                price: Number(data.price),
                area: Number(data.area),
                province: provinceMatch.id,
                district: districtMatch.id,
                ward: wardMatch?.id || undefined,
                address: data.address,
                images: imagePayload,                    // ← toàn bộ mediaId
                seller: user?.id,     // tùy bạn truyền user thế nào
            }
            console.log("images", payloadData)
            const result = property
                ? await updateProperty(property.id, payloadData)
                : await createProperty(payloadData)

            if (result.success) {
                toast.success(property ? "Cập nhật thành công!" : "Đăng tin thành công!")
                router.back()
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
        <div className="min-h-screen bg-background mb-16">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <h1 className="text-2xl font-bold">
                    {property ? "Chỉnh sửa tin đăng" : "Đăng tin mới"}
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* === Nhu cầu === */}
                    <Collapsible open={isDemandOpen} onOpenChange={setIsDemandOpen}>
                        <div className="border rounded-lg">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
                                <h3 className="text-base font-semibold">Nhu cầu <span className="text-destructive">*</span></h3>
                                {isDemandOpen ? <ChevronUp /> : <ChevronDown />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 pt-0 space-y-4">
                                    <Label className="text-label mb-2">Loại giao dịch <span className="text-destructive">*</span></Label>
                                    <Select defaultValue="sell">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sell">Bán</SelectItem>
                                            <SelectItem value="rent">Cho thuê</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* === Địa chỉ === */}
                    <Collapsible open={isAddressOpen} onOpenChange={setIsAddressOpen}>
                        <div className="border rounded-lg">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
                                <h3 className="text-base font-semibold">Địa chỉ <span className="text-destructive">*</span></h3>
                                {isAddressOpen ? <ChevronUp /> : <ChevronDown />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 pt-0 space-y-4">
                                    {/* Ảnh */}
                                    <div>
                                        <Label className="text-label mb-2">Hình ảnh (tối đa 6) <span className="text-destructive">*</span></Label>

                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={imageItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {imageItems.map((item) => (
                                                        <SortableImage
                                                            key={item.id}
                                                            id={item.id}
                                                            url={item.url}
                                                            onRemove={() => handleRemoveImage(item.id)}
                                                        />
                                                    ))}

                                                    {imageItems.length < 6 && (
                                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/10 transition">
                                                            <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">Chọn ảnh</span>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>

                                    {/* Tỉnh/Thành */}
                                    <div>
                                        <Label className="text-label mb-2">Tỉnh/Thành phố <span className="text-destructive">*</span></Label>
                                        <Select
                                            defaultValue={String((property?.province as any)?.code)}
                                            value={watch("province")}
                                            onValueChange={(v) => {
                                                setValue("province", v)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={watch("province") || "Chọn Tỉnh/Thành phố"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* {errors.province_id && <p className="text-sm text-destructive">{errors.province_id.message}</p>} */}
                                    </div>

                                    {/* Quận/Huyện */}
                                    <div>
                                        <Label className="text-label mb-2">Quận/Huyện <span className="text-destructive">*</span></Label>
                                        <Select
                                            defaultValue={String((property?.district as any)?.code)}
                                            value={watch("district")}
                                            onValueChange={(v) => {
                                                setValue("district", v)
                                            }}
                                            disabled={!watch("province")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={watch("district") || "Chọn Quận/Huyện"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {districts.map((d) => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        {d.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.district && <p className="text-sm text-destructive">{errors.district.message}</p>}
                                    </div>

                                    {/* Phường/Xã */}
                                    <div>
                                        <Label className="text-label mb-2">Phường/Xã <span className="text-destructive">*</span></Label>
                                        <Select
                                            defaultValue={String((property?.ward as any)?.code)}
                                            value={watch("ward")}
                                            onValueChange={(v) => {
                                                setValue("ward", v)
                                            }}
                                            disabled={!watch("district")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={watch("ward") || "Chọn Phường/Xã"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wards.map((w) => (
                                                    <SelectItem key={w.value} value={w.value}>
                                                        {w.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* {errors.ward_id && <p className="text-sm text-destructive">{errors.ward_id.message}</p>} */}
                                    </div>


                                    <div>
                                        <Label className="text-label mb-2">Địa chỉ cụ thể <span className="text-destructive">*</span></Label>
                                        <Input {...register("address")} placeholder="Số nhà, tên đường" />
                                        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* === Thông tin chính === */}
                    <Collapsible open={isMainInfoOpen} onOpenChange={setIsMainInfoOpen}>
                        <div className="border rounded-lg">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
                                <h3 className="text-base font-semibold">Thông tin chính <span className="text-destructive">*</span></h3>
                                {isMainInfoOpen ? <ChevronUp /> : <ChevronDown />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <Label className="text-label mb-2">Loại bất động sản <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={watch("type")}
                                            defaultValue={(property?.type as any)?.value}
                                            onValueChange={(v) => setValue("type", v as any)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại bất động sản" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {propertyTypes.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="text-label mb-2">Diện tích (m²) <span className="text-destructive">*</span></Label>
                                        <Input type="number" {...register("area", { valueAsNumber: true })} />
                                        {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="text-label mb-2">Giá <span className="text-destructive">*</span></Label>
                                        <PriceInput
                                            onChange={(v) => setValue("price", v, { shouldValidate: true })}
                                            defaultValue={existingProperty?.price}
                                        />
                                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* === Nội dung === */}
                    <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
                        <div className="border rounded-lg">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
                                <h3 className="text-base font-semibold">Nội dung & mô tả <span className="text-destructive">*</span></h3>
                                {isContentOpen ? <ChevronUp /> : <ChevronDown />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Tạo nhanh với AI</p>
                                            <p className="text-xs text-muted-foreground">
                                                Bạn còn <span className="font-semibold">100</span> lượt dùng
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" className="gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Tạo với AI
                                        </Button>
                                    </div>

                                    <div>
                                        <Label className="text-label mb-2">Tiêu đề <span className="text-destructive">*</span></Label>
                                        <Input
                                            {...register("title")}
                                            maxLength={99}
                                            onChange={(e) => {
                                                register("title").onChange(e);
                                                setTitleLength(e.target.value.length);
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">{titleLength}/99 ký tự</p>
                                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="text-label mb-2">Mô tả <span className="text-destructive">*</span></Label>
                                        <LexicalEditor
                                            initialValue={property?.description || { root: { children: [], type: "root", version: 1 } }}
                                            onChange={(json) => {
                                                // ĐẢM BẢO LUÔN CÓ GIÁ TRỊ
                                                const safeJson = json || { root: { children: [], type: "root", version: 1 } }
                                                setLexicalValue(safeJson)
                                                setValue("description", safeJson, { shouldValidate: true })
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {descriptionLength}/3000 ký tự
                                        </p>
                                        {/* {errors.description && (
                                            <p className="text-sm text-destructive">{errors.description.message}</p>
                                        )} */}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* === Nút hành động === */}
                    <div className="flex gap-4 justify-end pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting || uploading}>
                            {property ? "Cập nhật tin" : "Đăng tin"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}