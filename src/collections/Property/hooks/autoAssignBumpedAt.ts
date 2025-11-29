// src/collections/Properties/hooks/autoAssignBumpedAt.ts
import { CollectionBeforeChangeHook } from 'payload'

export const autoAssignBumpedAt: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create') {
    const now = new Date().toISOString()
    data.bumped_at = now
    data.last_bumped_at = now
  }
  return data
}