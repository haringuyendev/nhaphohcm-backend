// components/Property/admin/Create/DemandSection.tsx
'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronUp, ChevronDown } from "lucide-react"
import { memo } from "react"
import { SelectContent } from "@radix-ui/react-select"

type DemandSectionProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function DemandSection({ isOpen, onOpenChange }: DemandSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="border rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/5">
          <h3 className="text-base font-semibold">Nhu cầu <span className="text-destructive">*</span></h3>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0">
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
  )
}

export default memo(DemandSection)