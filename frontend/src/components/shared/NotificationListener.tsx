import { useEffect, useRef } from "react"
import { useNotificationStore } from "@/stores/notificationStore"
import { useWebSocketNotifications } from "@/hooks/useWebSocketNotifications"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

export default function NotificationListener() {
  // Use targeted selectors to avoid re-renders on unrelated store changes
  const notifications = useNotificationStore((state) => state.notifications)
  const enabled = useNotificationStore((state) => state.preferences.enabled)
  const showToasts = useNotificationStore((state) => state.preferences.showToasts)
  const categories = useNotificationStore((state) => state.preferences.categories)
  const lastNotificationIdRef = useRef<string | null>(null)

  // Initialize WebSocket connection for real-time notifications
  useWebSocketNotifications()

  // Show toast for new notifications — this is a true side effect
  useEffect(() => {
    if (notifications.length === 0) return

    const latestNotification = notifications[0]

    if (
      latestNotification.id !== lastNotificationIdRef.current &&
      enabled &&
      showToasts &&
      categories[latestNotification.category]
    ) {
      const Icon = notificationIcons[latestNotification.type]

      const toastFn = toast[latestNotification.type] || toast

      toastFn(latestNotification.title, {
        description: latestNotification.message,
        icon: <Icon className="w-4 h-4" />,
        action: latestNotification.actionUrl
          ? {
              label: latestNotification.actionLabel || "View",
              onClick: () => {
                window.location.href = latestNotification.actionUrl!
              },
            }
          : undefined,
      })

      lastNotificationIdRef.current = latestNotification.id
    }
  }, [notifications, enabled, showToasts, categories])

  return null
}
