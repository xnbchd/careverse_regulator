import { useEffect, useRef } from 'react'
import { getWebSocketClient, type WebSocketClient } from '@/lib/websocket'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Notification } from '@/stores/notificationStore'

/**
 * Hook to connect WebSocket to notification store
 */
export function useWebSocketNotifications() {
  const clientRef = useRef<WebSocketClient | null>(null)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const preferences = useNotificationStore((state) => state.preferences)

  useEffect(() => {
    // Only initialize if notifications are enabled
    if (!preferences.enabled) {
      return
    }

    try {
      // Get or create WebSocket client
      const client = getWebSocketClient()
      clientRef.current = client

    // Subscribe to notification messages
    const unsubscribeNotification = client.on(
      'notification',
      (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        // Check if category is enabled in preferences
        if (preferences.categories[data.category]) {
          addNotification(data)
        }
      }
    )

    // Subscribe to connection events for status notifications
    const unsubscribeConnect = client.onConnect(() => {
      console.log('WebSocket connected for notifications')
      // Optionally show a system notification
      // addNotification({
      //   type: 'info',
      //   category: 'system',
      //   title: 'Connected',
      //   message: 'Real-time notifications enabled',
      // })
    })

    const unsubscribeDisconnect = client.onDisconnect(() => {
      console.log('WebSocket disconnected')
      // Optionally show a warning
      // addNotification({
      //   type: 'warning',
      //   category: 'system',
      //   title: 'Disconnected',
      //   message: 'Attempting to reconnect...',
      // })
    })

    const unsubscribeError = client.onError((error) => {
      console.error('WebSocket error:', error)
    })

      // Connect if not already connected
      if (!client.isConnected) {
        client.connect()
      }

      // Cleanup on unmount
      return () => {
        unsubscribeNotification()
        unsubscribeConnect()
        unsubscribeDisconnect()
        unsubscribeError()
        // Note: We don't disconnect here because other components might be using it
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket notifications:', error)
      // Fail silently - app should work without WebSocket
    }
  }, [preferences.enabled, preferences.categories, addNotification])

  return {
    isConnected: clientRef.current?.isConnected ?? false,
    state: clientRef.current?.state ?? 'CLOSED',
  }
}
