/**
 * WebSocket client for real-time notifications
 */

type MessageHandler = (data: any) => void
type ConnectionHandler = () => void
type ErrorHandler = (error: Event) => void

export interface WebSocketConfig {
  url?: string
  reconnectInterval?: number
  heartbeatInterval?: number
  maxReconnectAttempts?: number
  enabled?: boolean // Allow disabling WebSocket
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private connectHandlers: Set<ConnectionHandler> = new Set()
  private disconnectHandlers: Set<ConnectionHandler> = new Set()
  private errorHandlers: Set<ErrorHandler> = new Set()
  private permanentlyDisabled = false // Flag for permanent disable after connection refused

  private config: Required<WebSocketConfig> & { enabled: boolean } = {
    url: this.getWebSocketURL(),
    reconnectInterval: 5000, // 5 seconds
    heartbeatInterval: 30000, // 30 seconds
    maxReconnectAttempts: 3, // Reduced from 10 to 3
    enabled: import.meta.env.VITE_WS_ENABLED !== 'false', // Can disable via env var
  }

  constructor(config?: WebSocketConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Get WebSocket URL from environment or construct from current location
   */
  private getWebSocketURL(): string {
    // Check environment variable first
    const envUrl = import.meta.env.VITE_WS_URL
    if (envUrl) return envUrl

    // Construct from current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/api/ws`
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    // Check if disabled
    if (!this.config.enabled || this.permanentlyDisabled) {
      console.log('WebSocket is disabled, skipping connection')
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    try {
      console.log(`Connecting to WebSocket: ${this.config.url}`)
      this.ws = new WebSocket(this.config.url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.connectHandlers.forEach((handler) => handler())
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.errorHandlers.forEach((handler) => handler(error))

        // If connection refused, permanently disable to avoid blocking the app
        if (this.reconnectAttempts >= 2) {
          console.warn('WebSocket connection repeatedly failed, disabling reconnection attempts')
          this.permanentlyDisabled = true
          this.clearReconnectTimer()
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason)
        this.stopHeartbeat()
        this.disconnectHandlers.forEach((handler) => handler())

        // Don't reconnect if connection was refused (1006) or similar errors
        if (event.code === 1006 && this.reconnectAttempts >= 2) {
          console.warn('WebSocket connection refused, disabling further attempts')
          this.permanentlyDisabled = true
          return
        }

        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.permanentlyDisabled = true // Don't retry on creation errors
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat()
    this.stopReconnect()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Send message to server
   */
  send(type: string, data: any): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message')
      return
    }

    const message = JSON.stringify({ type, data })
    this.ws.send(message)
  }

  /**
   * Subscribe to messages of a specific type
   */
  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }

    this.messageHandlers.get(type)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.messageHandlers.delete(type)
        }
      }
    }
  }

  /**
   * Subscribe to connection events
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler)
    return () => this.connectHandlers.delete(handler)
  }

  /**
   * Subscribe to disconnection events
   */
  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler)
    return () => this.disconnectHandlers.delete(handler)
  }

  /**
   * Subscribe to error events
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)
    return () => this.errorHandlers.delete(handler)
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: { type: string; data: any }): void {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data)
        } catch (error) {
          console.error(`Error in message handler for type "${message.type}":`, error)
        }
      })
    }

    // Also call wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*')
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(message)
        } catch (error) {
          console.error('Error in wildcard message handler:', error)
        }
      })
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    // Don't reconnect if permanently disabled
    if (this.permanentlyDisabled || !this.config.enabled) {
      console.log('WebSocket reconnection disabled')
      return
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached, giving up')
      this.permanentlyDisabled = true
      return
    }

    this.reconnectAttempts++
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`
    )

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval)
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Get connection state
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Get connection state string
   */
  get state(): string {
    if (!this.ws) return 'CLOSED'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'OPEN'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'CLOSED'
      default:
        return 'UNKNOWN'
    }
  }
}

/**
 * Global WebSocket client instance
 */
let wsClient: WebSocketClient | null = null

/**
 * Get or create WebSocket client
 */
export function getWebSocketClient(config?: WebSocketConfig): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(config)
  }
  return wsClient
}

/**
 * Initialize WebSocket connection
 */
export function initializeWebSocket(config?: WebSocketConfig): WebSocketClient {
  const client = getWebSocketClient(config)
  client.connect()
  return client
}

/**
 * Close WebSocket connection
 */
export function closeWebSocket(): void {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}

export default getWebSocketClient
