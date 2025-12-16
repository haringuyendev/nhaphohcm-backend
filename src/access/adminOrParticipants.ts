import { Access } from "payload"
import { checkRole } from "./utilities"

export const adminOrParticipants: Access = ({ req: { user } }) => {
  if (user) {
    // Admin toàn quyền
    if (checkRole(['admin'], user)) {
      return true
    }
    // Người dùng chỉ được xem conversation mà họ là participant
    return {
      participants: {
        contains:user.id
      },
    }
  }

  return false
}
