import { useEffect, useRef } from "react"
import { getWebSocketClient, type WebSocketClient } from "@/lib/websocket"
import { useNotificationStore } from "@/stores/notificationStore"
import type { Notification } from "@/stores/notificationStore"

/**
 * Hook to connect WebSocket to notification store.
 * useEffect is appropriate here — it manages an external WebSocket subscription.
 */
export function useWebSocketNotifications() {
  const clientRef = useRef<WebSocketClient | null>(null)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const enabled = useNotificationStore((state) => state.preferences.enabled)

  // Use a ref for categories so the subscription callback always reads the latest
  // without triggering effect re-runs when categories change
  const categoriesRef = useRef(useNotificationStore.getState().preferences.categories)
  useEffect(() => {
    return useNotificationStore.subscribe((state) => {
      categoriesRef.current = state.preferences.categories
    })
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const client = getWebSocketClient()
    clientRef.current = client

    const unsubscribeNotification = client.on(
      "notification",
      (data: Omit<Notification, "id" | "timestamp" | "read">) => {
        if (categoriesRef.current[data.category]) {
          addNotification(data)
        }
      }
    )

    const unsubscribeConnect = client.onConnect(() => {
      console.log("WebSocket connected for notifications")
    })

    const unsubscribeDisconnect = client.onDisconnect(() => {
      console.log("WebSocket disconnected")
    })

    const unsubscribeError = client.onError((error) => {
      console.error("WebSocket error:", error)
    })

    if (!client.isConnected) {
      client.connect()
    }

    return () => {
      unsubscribeNotification()
      unsubscribeConnect()
      unsubscribeDisconnect()
      unsubscribeError()
    }
  }, [enabled, addNotification])

  return {
    isConnected: clientRef.current?.isConnected ?? false,
    state: clientRef.current?.state ?? "CLOSED",
  }
}
