import { getWardsByDistrictSlug } from "@/endpoints/common/wards"
import { useEffect, useState } from "react"

export const useWards = (districtId: string) => {
    const [wards, setWards] = useState<any[]>([])
    useEffect(() => {
        if (!districtId) return
        const loadWards = async () => {
            const result = await getWardsByDistrictSlug({ district_slug: districtId })
            if (result) {
                const opts = result.map(p => ({
                    value: String(p.code),  // ép string ngay từ đầu
                    label: p.name,
                    id: p.id,
                }))
                setWards(opts)
            }
        }
        loadWards()
    }, [districtId])
    return wards
}