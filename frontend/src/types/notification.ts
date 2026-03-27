export type NotificationType = "alert" | "reminder" | "followup" | "system"
export type NotificationPriority = "high" | "medium" | "low"

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  isRead: boolean
  timestamp: string // ISO 8601 format
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationFilters {
  search?: string
  type?: NotificationType | "all"
  status?: "read" | "unread" | "all"
  priority?: NotificationPriority | "all"
  dateRange?: {
    start: string
    end: string
  }
}
