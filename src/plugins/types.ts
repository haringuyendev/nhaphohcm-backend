import { Media, Property as PayloadProperty } from '@/payload-types'

/**
 */
export const MESSAGE_TYPES = {
  FETCH_COLLECTION: 'FETCH_COLLECTION',
  COLLECTION_DATA: 'COLLECTION_DATA',
  COLLECTION_CHANGED: 'COLLECTION_CHANGED',
} as const

/**
 * Connection status messages
 */
export const CONNECTION_STATUS = {
  CONNECTING: 'Connecting...',
  CONNECTED: 'Connected',
  DISCONNECTED: 'Disconnected',
  FAILED: 'Failed to connect',
  ERROR: 'Error',
} as const

export type { PayloadProperty as Property }

/**
 * Represents a WebSocket message structure for real-time updates
 */
export type WSMessage = {
  type: string
  collection: string
  operation: 'create' | 'update' | 'delete' | 'get'
  doc: PayloadProperty
  userId?: string
  conversationId?: string
}

export type ConnectionStatus = (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS]