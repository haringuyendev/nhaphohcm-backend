// src/types/global.d.ts
import { WebSocketServer } from 'ws'

declare global {
  var payloadWebSocketServer: WebSocketServer | undefined
}

export {}