import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotificationType = "success" | "error" | "warning" | "info"
export type NotificationCategory =
  | "affiliation"
  | "license"
  | "inspection"
  | "system"
  | "bulk_action"

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  enabled: boolean
  showToasts: boolean
  playSound: boolean
  categories: {
    affiliation: boolean
    license: boolean
    inspection: boolean
    system: boolean
    bulk_action: boolean
  }
}

interface NotificationState {
  notifications: Notification[]
  preferences: NotificationPreferences
  unreadCount: number

  // Actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  getNotificationsByCategory: (category: NotificationCategory) => Notification[]
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  showToasts: true,
  playSound: false,
  categories: {
    affiliation: true,
    license: true,
    inspection: true,
    system: true,
    bulk_action: true,
  },
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      preferences: defaultPreferences,
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }))

        const { preferences } = get()
        if (
          preferences.enabled &&
          preferences.playSound &&
          preferences.categories[notification.category]
        ) {
          try {
            const audio = new Audio("/notification.mp3")
            audio.volume = 0.5
            audio.play().catch(() => {})
          } catch (error) {}
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const wasUnread = notification && !notification.read

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },

      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
            categories: {
              ...state.preferences.categories,
              ...(newPreferences.categories || {}),
            },
          },
        }))
      },

      getNotificationsByCategory: (category) => {
        return get().notifications.filter((n) => n.category === category)
      },
    }),
    {
      name: "notification-storage",
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences,
        unreadCount: state.unreadCount,
      }),
    }
  )
)

// Helper function to create notifications with consistent formatting
export const createNotification = {
  affiliationApproved: (professionalName: string, facilityName: string) => ({
    type: "success" as NotificationType,
    category: "affiliation" as NotificationCategory,
    title: "Affiliation Approved",
    message: `${professionalName}'s affiliation with ${facilityName} has been approved.`,
    actionUrl: "/affiliations",
    actionLabel: "View Affiliations",
  }),

  affiliationRejected: (professionalName: string, facilityName: string) => ({
    type: "error" as NotificationType,
    category: "affiliation" as NotificationCategory,
    title: "Affiliation Rejected",
    message: `${professionalName}'s affiliation with ${facilityName} has been rejected.`,
    actionUrl: "/affiliations",
    actionLabel: "View Affiliations",
  }),

  licenseApproved: (licenseNumber: string) => ({
    type: "success" as NotificationType,
    category: "license" as NotificationCategory,
    title: "License Approved",
    message: `License ${licenseNumber} has been approved.`,
    actionUrl: `/license-management/${licenseNumber}`,
    actionLabel: "View License",
  }),

  licenseDenied: (licenseNumber: string) => ({
    type: "error" as NotificationType,
    category: "license" as NotificationCategory,
    title: "License Denied",
    message: `License ${licenseNumber} has been denied.`,
    actionUrl: `/license-management/${licenseNumber}`,
    actionLabel: "View License",
  }),

  licenseExpiring: (licenseNumber: string, daysUntilExpiry: number) => ({
    type: "warning" as NotificationType,
    category: "license" as NotificationCategory,
    title: "License Expiring Soon",
    message: `License ${licenseNumber} will expire in ${daysUntilExpiry} days.`,
    actionUrl: `/license-management/${licenseNumber}`,
    actionLabel: "Renew License",
  }),

  inspectionScheduled: (facilityName: string, date: string) => ({
    type: "info" as NotificationType,
    category: "inspection" as NotificationCategory,
    title: "Inspection Scheduled",
    message: `Inspection scheduled for ${facilityName} on ${date}.`,
    actionUrl: "/inspections",
    actionLabel: "View Inspections",
  }),

  inspectionCompleted: (facilityName: string) => ({
    type: "success" as NotificationType,
    category: "inspection" as NotificationCategory,
    title: "Inspection Completed",
    message: `Inspection for ${facilityName} has been completed.`,
    actionUrl: "/inspections",
    actionLabel: "View Report",
  }),

  bulkActionCompleted: (action: string, succeeded: number, failed: number) => ({
    type: failed > 0 ? ("warning" as NotificationType) : ("success" as NotificationType),
    category: "bulk_action" as NotificationCategory,
    title: "Bulk Action Completed",
    message: `${action}: ${succeeded} succeeded, ${failed} failed.`,
    metadata: { action, succeeded, failed },
  }),

  systemUpdate: (message: string) => ({
    type: "info" as NotificationType,
    category: "system" as NotificationCategory,
    title: "System Update",
    message,
  }),

  systemError: (message: string) => ({
    type: "error" as NotificationType,
    category: "system" as NotificationCategory,
    title: "System Error",
    message,
  }),
}
