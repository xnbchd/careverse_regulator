/**
 * WebSocket client for real-time notifications using Socket.IO
 */
import { io, type Socket } from "socket.io-client"

type MessageHandler = (data: any) => void
type ConnectionHandler = () => void
type ErrorHandler = (error: Event) => void

export interface WebSocketConfig {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export class WebSocketClient {
  private socket: Socket | null = null
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private connectHandlers: Set<ConnectionHandler> = new Set()
  private disconnectHandlers: Set<ConnectionHandler> = new Set()
  private errorHandlers: Set<ErrorHandler> = new Set()

  private config: Required<WebSocketConfig> = {
    url: this.getSocketURL(),
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  }

  constructor(config?: WebSocketConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  private getSocketURL(): string {
    const envUrl = import.meta.env.VITE_WS_URL
    if (envUrl) return envUrl

    const socketioPort = (window as any).frappe?.boot?.socketio_port || 9000
    const protocol = window.location.protocol === "https:" ? "https:" : "http:"
    const hostname = window.location.hostname
    return `${protocol}//${hostname}:${socketioPort}`
  }

  connect(): void {
    if (this.socket?.connected) {
      console.log("WebSocket already connected")
      return
    }

    try {
      console.log(`Connecting to Socket.IO: ${this.config.url}`)
      this.socket = io(this.config.url, {
        reconnection: true,
        reconnectionAttempts: this.config.maxReconnectAttempts,
        reconnectionDelay: this.config.reconnectInterval,
        transports: ["websocket", "polling"],
      })

      this.socket.on("connect", () => {
        console.log("WebSocket connected")
        this.connectHandlers.forEach((handler) => handler())
      })

      this.socket.on("disconnect", () => {
        console.log("WebSocket disconnected")
        this.disconnectHandlers.forEach((handler) => handler())
      })

      this.socket.on("connect_error", (error: any) => {
        console.error("WebSocket connection error:", error)
        this.errorHandlers.forEach((handler) => handler(error))
      })

      // Listen for all custom events via a catch-all
      this.socket.onAny((eventName: string, data: any) => {
        this.handleMessage({ type: eventName, data })
      })
    } catch (error) {
      console.error("Failed to create Socket.IO connection:", error)
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  send(type: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn("WebSocket not connected, cannot send message")
      return
    }

    this.socket.emit(type, data)
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }

    this.messageHandlers.get(type)!.add(handler)

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

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler)
    return () => this.connectHandlers.delete(handler)
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler)
    return () => this.disconnectHandlers.delete(handler)
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)
    return () => this.errorHandlers.delete(handler)
  }

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

    const wildcardHandlers = this.messageHandlers.get("*")
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(message)
        } catch (error) {
          console.error("Error in wildcard message handler:", error)
        }
      })
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  get state(): string {
    if (!this.socket) return "CLOSED"
    return this.socket.connected ? "OPEN" : "CLOSED"
  }
}

let wsClient: WebSocketClient | null = null

export function getWebSocketClient(config?: WebSocketConfig): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient(config)
  }
  return wsClient
}

export function initializeWebSocket(config?: WebSocketConfig): WebSocketClient {
  const client = getWebSocketClient(config)
  client.connect()
  return client
}

export function closeWebSocket(): void {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}

export default getWebSocketClient
