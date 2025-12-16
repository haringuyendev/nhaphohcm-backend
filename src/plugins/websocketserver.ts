import http from 'http'
import type { Config } from 'payload'
import { Server as IOServer } from 'socket.io'
import { MESSAGE_TYPES } from './types'

interface PluginTypes {
  port?: number
  collections?: string[]
}

let io: IOServer

export const websocketServerPlugin =
  (pluginOptions: PluginTypes = {}) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    const WS_PORT = pluginOptions.port ?? 8081

    // Start Socket.IO server
    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }

      // Start dedicated HTTP server for socket.io
      const server = http.createServer()
      io = new IOServer(server, {
        cors: { origin: 'http://localhost:3000', credentials: true },
        path: '/socket.io',
      })

      server.listen(WS_PORT, () => {
        console.log(`🔥 Socket.IO server is running on port ${WS_PORT}`)
      })

      payload.io = io

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on(MESSAGE_TYPES.FETCH_COLLECTION, async (config) => {
          try {
            const {
              col, // tên collection
              limit = 20,
              sort,
              select,
              where,
              depth = 4, // default 4 vì bạn cần populate avatar
            } = config ?? {}

            if (!col) {
              console.warn("FETCH_COLLECTION missing 'col'. Received:", config)
              return
            }

            const results = await payload.find({
              collection: col,
              limit,
              sort,
              select,
              where,
              depth,
            })

            console.log(`📤 SEND COLLECTION_DATA for: ${col} (${results.docs.length} docs)`)

            socket.emit(MESSAGE_TYPES.COLLECTION_DATA, {
              collection: col,
              docs: results.docs,
            })
          } catch (err) {
            console.error('❌ FETCH_COLLECTION error:', err)
            socket.emit(MESSAGE_TYPES.COLLECTION_DATA, {
              collection: config?.col,
              docs: [],
              error: true,
            })
          }
        })

        socket.on('JOIN_USER', (userId) => {
          if (!userId) return
          socket.join(`user_${userId}`)
          console.log(`👤 Socket ${socket.id} joined user_${userId}`)
        })
      })
    }

    return config
  }
