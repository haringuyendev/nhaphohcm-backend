'use client'

import { useState, useEffect, memo } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Upload, ChevronUp, ChevronDown } from "lucide-react"
import { DndContext, TouchSensor, closestCenter, useSensor } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core"
import { toast } from "sonner"
import { SortableImage } from "../SortableImage"
import { useProvinces } from "@/hooks/useProvinces"
import { useDistricts } from "@/hooks/use-districts"
import { useWards } from "@/hooks/use-wards"
import { Property } from "@/payload-types"

type ImageItem = {
    id: string
    url: string
    mediaId?: string
    file?: File
    blurhash?: string
}

type AddressSectionProps = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    watch: any
    setValue: any
    register: any
    errors: any
    property: Property | null
    onImagesChange?: (images: ImageItem[]) => void
}

function AddressSection({
    isOpen,
    setIsOpen,
    watch,
    setValue,
    register,
    errors,
    property,
    onImagesChange,
}: AddressSectionProps) {
    const [imageItems, setImageItems] = useState<ImageItem[]>([])

    // State riêng để quản lý địa chỉ - SIÊU ỔN ĐỊNH
    const [location, setLocation] = useState({
        province: "",
        district: "",
        ward: "",
    })

    const provinces = useProvinces()
    const districts = useDistricts(Number(location.province))
    const wards = useWards(Number(location.district))

    // Load ảnh cũ khi edit
    useEffect(() => {
        if (!property?.images) return
        const existing = (property.images as any[]).map((img: any) => ({
            id: img.id,
            url: img.image?.url
                ? (img.image.url.startsWith("/") ? img.image.url : `/${img.image.url}`)
                : `/media/${img.image?.filename || img.image}`,
            mediaId: (img.image?.id || img.image) as string,
            blurhash: img.image?.blurhash,
        }))
        setImageItems(existing)
    }, [property])
    // Load địa chỉ cũ khi edit
    useEffect(() => {
        if (!property) return
        setLocation({
            province: String((property.province as any)?.code ?? ""),
            district: String((property.district as any)?.code ?? ""),
            ward: String((property.ward as any)?.code ?? ""),
        })
    }, [property])
    // Đồng bộ location → react-hook-form (chỉ khi cần thiết)
    useEffect(() => {
        const provinceMatch = provinces.find(p => String(p.value) === location.province)
        const districtMatch = districts.find(d => String(d.value) === location.district)
        const wardMatch = location.ward
            ? wards.find(w => String(w.value) === location.ward)
            : null

        if (provinceMatch) setValue("province", provinceMatch.id)
        if (districtMatch) setValue("district", districtMatch.id)
        if (wardMatch) setValue("ward", wardMatch.id)
    }, [districts, location, provinces, setValue, wards])

    // Callback cho parent biết ảnh thay đổi
    useEffect(() => {
        onImagesChange?.(imageItems)
    }, [imageItems, onImagesChange])

    const sensors = useSensors(
        // 1. PointerSensor – cho mouse + touch (nhưng có delay hợp lý)
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Phải di chuyển ít nhất 8px mới tính là drag
            },
        }),

        // 2. TouchSensor – QUAN TRỌNG: thêm delay để tránh conflict với scroll
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,       // Chờ 150ms trước khi kích hoạt drag
                tolerance: 8,     // Cho phép di chuyển 8px trong lúc chờ mà không hủy
            },
        }),

        // 3. KeyboardSensor – giữ nguyên
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return

        const remaining = 6 - imageItems.length
        if (remaining <= 0) return toast.error("Tối đa 6 ảnh")

        const newFiles = Array.from(files).slice(0, remaining)
        const newItems = newFiles.map(file => ({
            id: `pending-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            file,
        }))

        setImageItems(prev => [...prev, ...newItems])
        toast.success(`Đã thêm ${newFiles.length} ảnh`)
    }

    const handleRemoveImage = (id: string) => {
        setImageItems(prev => {
            const removed = prev.find(i => i.id === id)
            if (removed?.url.startsWith("blob:")) {
                URL.revokeObjectURL(removed.url)
            }
            return prev.filter(i => i.id !== id)
        })
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setImageItems(items => {
            const oldIdx = items.findIndex(i => i.id === active.id)
            const newIdx = items.findIndex(i => i.id === over.id)
            return arrayMove(items, oldIdx, newIdx)
        })
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="border rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
                    <h3 className="text-base font-semibold">
                        Địa chỉ & Hình ảnh <span className="text-destructive">*</span>
                        {imageItems.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({imageItems.length}/6 ảnh)
                            </span>
                        )}
                    </h3>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="p-6 pt-0 space-y-6">
                        {/* Ảnh */}
                        <div>
                            <Label className="mb-2 text-label block">Hình ảnh <span className="text-destructive">*</span></Label>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={imageItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    <div className="grid grid-cols-3 gap-4">
                                        {imageItems.map((item) => (
                                            <SortableImage
                                                key={item.id}
                                                id={item.id}
                                                url={item.url}
                                                blurDataURL={item.blurhash}
                                                onRemove={() => handleRemoveImage(item.id)}
                                            />
                                        ))}

                                        {imageItems.length < 6 && (
                                            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/10 transition">
                                                <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Thêm ảnh</span>
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
                            <p className="text-xs text-muted-foreground mt-2">Tối đa 6 ảnh. Kéo thả để sắp xếp.</p>
                        </div>

                        {/* Địa chỉ */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label className="text-label mb-2">Tỉnh/Thành phố <span className="text-destructive">*</span></Label>
                                <Select
                                    value={location.province}
                                    onValueChange={(v) => { if (provinces.length > 0) setLocation({ ...location, province: v }) }}
                                >
                                    <SelectTrigger><SelectValue placeholder="Chọn tỉnh/thành" /></SelectTrigger>
                                    <SelectContent>
                                        {provinces.map(p => (
                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-label mb-2">Quận/Huyện <span className="text-destructive">*</span></Label>
                                <Select
                                    value={location.district}
                                    onValueChange={(v) => { if (districts.length > 0) setLocation({ ...location, district: v }) }}
                                    disabled={!location.province}
                                >
                                    <SelectTrigger><SelectValue placeholder="Chọn quận/huyện" /></SelectTrigger>
                                    <SelectContent>
                                        {districts.map(d => (
                                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Phường/Xã - PHIÊN BẢN ĐẸP NHẤT */}
                            <div>
                                <Label className="text-label mb-2">Phường/Xã</Label>
                                <Select
                                    value={location.ward}
                                    onValueChange={(v) => { if (wards.length > 0) setLocation({ ...location, ward: v }) }}
                                    disabled={!location.district}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                !location.district
                                                    ? "Chọn quận/huyện trước"
                                                    : wards.length === 0
                                                        ? "Đang tải phường/xã..."
                                                        : "Chọn phường/xã"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wards.map(w => (
                                            <SelectItem key={w.value} value={w.value}>
                                                {w.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-label mb-2">Địa chỉ cụ thể <span className="text-destructive">*</span></Label>
                                <Input
                                    {...register("address")}
                                    placeholder="Ví dụ: 123 Nguyễn Văn Cừ"
                                    defaultValue={property?.address}
                                />
                                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}

export default memo(AddressSection)