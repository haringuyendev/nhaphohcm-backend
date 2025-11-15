import { getCachedGlobal } from '@/utilities/getGlobals'

import './index.css'
import { HeaderClient } from './index.client'
import React, { Suspense } from 'react'

export async function Header() {
  const header = await getCachedGlobal('header', 1)()

  return <Suspense fallback={<div>Loading...</div>}>
    <HeaderClient header={header} />
  </Suspense>
}
