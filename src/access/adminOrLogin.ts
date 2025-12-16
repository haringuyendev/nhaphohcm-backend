import type { Access } from 'payload'

export const adminOrLogin: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return false
}
