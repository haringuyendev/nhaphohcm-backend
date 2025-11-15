'use client';
import { createContext, useState } from "react"


export interface FilterContextType {
  filterOpen: boolean
  searchQuery: string
  setFilterOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

const initialContext: FilterContextType = {
  filterOpen: false,
  searchQuery: "",
  setFilterOpen: () => null,
  setSearchQuery: () => null,
}

export const FilterContext = createContext(initialContext)

export const FilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  return <FilterContext.Provider value={{ filterOpen, setFilterOpen, searchQuery, setSearchQuery }}>{children}</FilterContext.Provider>
}