import { getProperty_types } from "@/endpoints/common/properties"
import { useEffect, useState } from "react"

export const usePropertyTypes = () => {
    const [propertyTypes, setPropertyTypes] = useState<any[]>([])
    useEffect(() => {
        const loadPropertyTypes = async () => {
            const result = await getProperty_types()
            if (result) {
                const opts = result.map(p => ({
                    value: String(p.value),  // ép string ngay từ đầu
                    label: p.label,
                    id: p.id,
                }))
                setPropertyTypes(opts)
            }
        }
        loadPropertyTypes()
    }, [])
    return propertyTypes
}