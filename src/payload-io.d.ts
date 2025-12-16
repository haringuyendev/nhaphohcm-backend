import type { Server as IOServer } from "socket.io";
import "payload";

declare module "payload" {
  interface BasePayload {
    io?: IOServer; // 👈 Add custom Socket.IO instance
  }
}
