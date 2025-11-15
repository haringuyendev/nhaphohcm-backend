import { useContext } from 'react'
import { FilterContext, FilterContextType } from '../providers/Filter'

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider')
  }
  return context
}