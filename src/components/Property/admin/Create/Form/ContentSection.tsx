'use client'

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { memo } from "react"
import LexicalEditor from "../RichtextEditor"

type ContentSectionProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  titleLength: number
  setTitleLength: (len: number) => void
  register: any
  errors: any
  property?: any
  lexicalValue: any
  setLexicalValue: (value: any) => void
  setValue: any
}

function ContentSection({
  isOpen,
  onOpenChange,
  titleLength,
  setTitleLength,
  register,
  errors,
  property,
  lexicalValue,
  setLexicalValue,
  setValue,
}: ContentSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="border rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
          <h3 className="text-base font-semibold">
            Nội dung & mô tả <span className="text-destructive">*</span>
          </h3>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-6">

            {/* AI Button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tạo nhanh với AI</p>
                <p className="text-xs text-muted-foreground">Bạn còn <span className="font-semibold">100</span> lượt dùng</p>
              </div>
              <Button type="button" variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Tạo với AI
              </Button>
            </div>

            {/* Tiêu đề */}
            <div>
              <Label className="text-label mb-2">
                Tiêu đề tin đăng <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("title")}
                maxLength={99}
                placeholder="Ví dụ: Bán căn hộ 2PN full nội thất Quận 7 - 2.5 tỷ"
                onChange={(e) => {
                  register("title").onChange(e)
                  setTitleLength(e.target.value.length)
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">{titleLength}/99 ký tự</p>
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            {/* Mô tả chi tiết */}
            <div>
              <Label className="text-label mb-2">Mô tả chi tiết <span className="text-destructive">*</span></Label>
              <LexicalEditor
                initialValue={property?.description || { root: { children: [], type: "root", version: 1 } }}
                onChange={(json) => {
                  const safeJson = json || { root: { children: [], type: "root", version: 1 } }
                  setLexicalValue(safeJson)
                  setValue("description", safeJson, { shouldValidate: true })
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mẹo: Dùng heading, danh sách, in đậm để bài viết đẹp hơn
              </p>
            </div>

          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default memo(ContentSection)