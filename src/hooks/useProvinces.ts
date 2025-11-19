import { getProvinces } from '@/endpoints/common/provinces'
import { useEffect, useState } from 'react'

export const useProvinces = () => {
  const [provinces, setProvinces] = useState<any[]>([])
  useEffect(() => {
    const loadProvinces = async () => {
      const result = await getProvinces()
      if (result) {
        const opts = result.map((p) => ({
          value: String(p.code),
          label: p.name,
          id: p.id,
        }))
        setProvinces(opts)
      }
    }
    loadProvinces()
  }, [])
  return provinces
}
