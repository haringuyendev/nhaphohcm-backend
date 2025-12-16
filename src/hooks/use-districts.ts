import { getDistrictsByProvince } from "@/endpoints/districts"
import { useEffect, useState } from "react"

export const useDistricts = (provinceId: number) => {
    const [districts, setDistricts] = useState<any[]>([])
    useEffect(() => {
        if (!provinceId || isNaN(provinceId)) return
        const loadDistricts = async () => {
            const result = await getDistrictsByProvince(provinceId)
            if (result) {
                const opts = result.map(p => ({
                    value: String(p.code),  // ép string ngay từ đầu
                    label: p.name,
                    id: p.id,
                }))
                setDistricts(opts)
            }
        }
        loadDistricts()
    }, [provinceId])
    return districts
}