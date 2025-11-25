'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown } from "lucide-react"
import PriceInput from "../PriceInput"
import { memo, useEffect, useState } from "react"
import { usePropertyTypes } from "@/hooks/use-property_types"
import { Property } from "@/payload-types"

type MainInfoSectionProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  watch: any
  setValue: any
  register: any
  errors: any
  property?: Property | null
  existingPrice?: number
}

function MainInfoSection({
  isOpen,
  onOpenChange,
  watch,
  setValue,
  register,
  errors,
  property,
  existingPrice,
}: MainInfoSectionProps) {

  const propertyTypes = usePropertyTypes()

  // Lưu VALUE (apartment, house...) để hiển thị
  const [selectedTypeValue, setSelectedTypeValue] = useState<string>(
    String((property?.type as any)?.value ?? "")
  )

  // Đồng bộ ID thật vào form mỗi khi chọn loại BĐS
  useEffect(() => {
    if (!selectedTypeValue) {
      setValue("type", undefined)
      return
    }
    const matched = propertyTypes.find(t => t.value === selectedTypeValue)
    if (matched) {
      setValue("type", matched.id) // ← ĐÂY LÀ CHÌA KHÓA!
    }
  }, [selectedTypeValue, propertyTypes, setValue])

  // Khi edit: load giá trị ban đầu
  useEffect(() => {
    if (property?.type) {
      setSelectedTypeValue(String((property.type as any)?.value ?? ""))
    }
  }, [property])

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="border rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
          <h3 className="text-base font-semibold">
            Thông tin chính <span className="text-destructive">*</span>
          </h3>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-6">

            {/* Loại bất động sản */}
            <div>
              <Label className="mb-2 text-label">
                Loại bất động sản <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedTypeValue}
                onValueChange={setSelectedTypeValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại bất động sản" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t.id} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>

            {/* Diện tích */}
            <div>
              <Label className="mb-2 text-label">
                Diện tích (m²) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="80"
                defaultValue={property?.area}
                {...register("area", { valueAsNumber: true })}
              />
              {errors.area && <p className="text-sm text-destructive mt-1">{errors.area.message}</p>}
            </div>

            {/* Giá tiền */}
            <div>
              <Label className="mb-2 text-label">
                Giá tiền <span className="text-destructive">*</span>
              </Label>
              <PriceInput
                onChange={(v) => setValue("price", v, { shouldValidate: true })}
                defaultValue={existingPrice || property?.price}
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>

          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default memo(MainInfoSection)