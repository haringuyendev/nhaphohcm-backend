// hooks/useWebSocket.ts (replace existing)
'use client'

import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'failed'

export const MESSAGE_TYPES = {
  FETCH_COLLECTION: 'FETCH_COLLECTION',
  COLLECTION_DATA: 'COLLECTION_DATA',
  COLLECTION_CHANGED: 'COLLECTION_CHANGED',
} as const

export type CollectionConfig = {
  col: string
  limit?: number
  sort?: any
  select?: any
  where?: any
  depth?: number
}

type UseWebSocketOpts = {
  url?: string
  path?: string
  transports?: ('websocket' | 'polling')[]
}

export function useWebSocket(
  onEvent: (event: string, payload: any) => void,
  configs: CollectionConfig[] = [], // chỉ làm template, không auto-fetch nữa
  opts: UseWebSocketOpts = {},
) {
  const socketRef = useRef<Socket | null>(null)
  const onEventRef = useRef(onEvent)
  const { user } = useAuth()
  const [status, setStatus] = useState<WSStatus>('disconnected')
  const [data, setData] = useState<Record<string, any[]>>({})
  const requestedRef = useRef<Record<string, CollectionConfig>>({})

  // index configs for quick lookup
  const configsIndexRef = useRef<Record<string, CollectionConfig>>({})
  useEffect(() => {
    const idx: Record<string, CollectionConfig> = {}
    for (const c of configs) {
      if (c?.col) idx[c.col] = c
    }
    configsIndexRef.current = idx
  }, [configs])

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const handleCollectionData = useCallback((payload: any) => {
    const collection = payload?.collection
    const docs = payload?.docs ?? []

    if (!collection) return

    setData((prev) => ({ ...prev, [collection]: docs }))
  }, [])

  const handleCollectionChanged = useCallback((msg: any) => {
    const col = msg.collection
    if (!col) return
    setData((prev) => {
      const arr = prev[col] ?? []
      const idx = arr.findIndex((i) => i.id === msg.doc.id)

      switch (msg.operation) {
        case 'create':
          if (idx !== -1) return prev
          return { ...prev, [col]: [...arr, msg.doc] }
        case 'update':
          if (idx !== -1) {
            const next = [...arr]
            next[idx] = msg.doc
            return { ...prev, [col]: next }
          } else {
            return { ...prev, [col]: [...arr, msg.doc] }
          }
        case 'delete':
          return { ...prev, [col]: arr.filter((i) => i.id !== msg.doc.id) }
        default:
          return prev
      }
    })
  }, [])

  const fetchCollection = useCallback((collection: string, overrides?: Partial<CollectionConfig>) => {
    const socket = socketRef.current
    if (!socket?.connected) {
      console.warn('[ws] socket not connected - skip fetchCollection for', collection)
      return
    }
    if (!collection) {
      console.warn('[ws] fetchCollection missing collection name', collection)
      return
    }

    // lấy template nếu có
    const base = configsIndexRef.current[collection] ?? { col: collection }

    // merge: overrides có ưu tiên
    const finalCfg: CollectionConfig = {
      ...base,
      ...overrides,
      col: collection,
    }

    // remember last requested config (useful for reconnect)
    requestedRef.current[collection] = finalCfg

    console.debug('[ws] emitting FETCH_COLLECTION', finalCfg)
    socket.emit(MESSAGE_TYPES.FETCH_COLLECTION, finalCfg)
  }, [])

  // init WS (NOTE: NO auto-fetch of configs here)
  useEffect(() => {
    if (!user) return

    const socket = io(opts.url ?? 'http://localhost:3001', {
      path: opts.path ?? '/socket.io',
      transports: opts.transports ?? ['websocket'],
      withCredentials: true,
    })

    socketRef.current = socket
    setStatus('connecting')

    socket.on('connect', () => {
      setStatus('connected')
      if (user?.id) socket.emit('JOIN_USER', user.id)

    })

    socket.on('disconnect', () => setStatus('disconnected'))
    socket.on('connect_error', () => setStatus('error'))
    socket.on('reconnect_failed', () => setStatus('failed'))

    socket.onAny((event, payload) => {
      // forward raw event
      try { onEventRef.current?.(event, payload) } catch (e) { console.error(e) }

      if (event === MESSAGE_TYPES.COLLECTION_DATA) handleCollectionData(payload)
      else if (event === MESSAGE_TYPES.COLLECTION_CHANGED) handleCollectionChanged(payload)
    })

    return () => {
      try { socket.disconnect() } catch (e) {}
      socketRef.current = null
      setStatus('disconnected')
      // don't clear requestedRef to allow reconnect-based re-fetch if desired
    }
  }, [user, opts.url, opts.path, opts.transports, handleCollectionData, handleCollectionChanged])

  return {
    socket: socketRef.current,
    status,
    data,
    fetchCollection,
    user,
  }
}
