import React from 'react'

import { Reason } from '@/data/common'
import NotFoundComponent from '@/components/Property/NotFound'

export default function NotFound() {
  return (
    <NotFoundComponent reason={Reason.NOT_FOUND} />
  )
}
