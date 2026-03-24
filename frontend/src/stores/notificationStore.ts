import { create } from 'zustand'
import type { Notification, NotificationFilters, NotificationType, NotificationPriority } from '@/types/notification'

// Mock data generator
const generateMockNotifications = (): Notification[] => {
  const now = new Date()
  return [
    {
      id: '1',
      type: 'alert',
      priority: 'high',
      title: 'Overdue Inspection',
      message: 'ABC Dental Clinic inspection scheduled for 3 days ago is still pending.',
      isRead: false,
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      actionUrl: '/inspections',
      actionLabel: 'View Inspection',
    },
    {
      id: '2',
      type: 'reminder',
      priority: 'medium',
      title: 'License Renewal Due',
      message: 'General Hospital license expires in 30 days. Renewal application not yet submitted.',
      isRead: false,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      actionUrl: '/license-management',
      actionLabel: 'View License',
    },
    {
      id: '3',
      type: 'followup',
      priority: 'high',
      title: 'Critical Finding Unresolved',
      message: 'Critical finding from XYZ Clinic inspection (Finding #CR-123) is overdue for resolution.',
      isRead: false,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      actionUrl: '/inspections',
      actionLabel: 'View Finding',
    },
    {
      id: '4',
      type: 'system',
      priority: 'low',
      title: 'System Maintenance Scheduled',
      message: 'The platform will undergo scheduled maintenance on Saturday, 2:00 AM - 4:00 AM.',
      isRead: true,
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'alert',
      priority: 'medium',
      title: 'New Affiliation Pending Approval',
      message: 'Dr. Jane Smith has submitted an affiliation request with City Hospital.',
      isRead: false,
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      actionUrl: '/affiliations',
      actionLabel: 'Review Affiliation',
    },
    {
      id: '6',
      type: 'reminder',
      priority: 'low',
      title: 'Monthly Report Due',
      message: 'Your monthly compliance report is due in 5 days.',
      isRead: true,
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      type: 'followup',
      priority: 'medium',
      title: 'Inspection Report Awaiting Signature',
      message: 'Inspection report for Sunshine Pharmacy requires your signature.',
      isRead: false,
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      actionUrl: '/inspections',
      actionLabel: 'Sign Report',
    },
    {
      id: '8',
      type: 'system',
      priority: 'medium',
      title: 'New Feature Available',
      message: 'Bulk export functionality is now available in License Management.',
      isRead: true,
      timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

interface NotificationState {
  notifications: Notification[]
  filters: NotificationFilters
  selectedIds: string[]
  isLoading: boolean

  // Actions
  initialize: () => void
  markAsRead: (ids: string[]) => void
  markAsUnread: (ids: string[]) => void
  deleteNotifications: (ids: string[]) => void
  markAllAsRead: () => void
  updateFilters: (filters: Partial<NotificationFilters>) => void
  setSelectedIds: (ids: string[]) => void
  clearFilters: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
  },
  selectedIds: [],
  isLoading: false,

  initialize: () => {
    const notifications = generateMockNotifications()
    set({ notifications, isLoading: false })
  },

  markAsRead: (ids: string[]) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, isRead: true } : n
      ),
      selectedIds: [],
    }))
  },

  markAsUnread: (ids: string[]) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.id) ? { ...n, isRead: false } : n
      ),
      selectedIds: [],
    }))
  },

  deleteNotifications: (ids: string[]) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => !ids.includes(n.id)),
      selectedIds: [],
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }))
  },

  updateFilters: (newFilters: Partial<NotificationFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  setSelectedIds: (ids: string[]) => {
    set({ selectedIds: ids })
  },

  clearFilters: () => {
    set({
      filters: {
        type: 'all',
        status: 'all',
        priority: 'all',
      },
    })
  },
}))

// Selector for filtered notifications
export const getFilteredNotifications = (state: NotificationState): Notification[] => {
  let filtered = state.notifications

  // Filter by search
  if (state.filters.search) {
    const search = state.filters.search.toLowerCase()
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search)
    )
  }

  // Filter by type
  if (state.filters.type && state.filters.type !== 'all') {
    filtered = filtered.filter((n) => n.type === state.filters.type)
  }

  // Filter by status (read/unread)
  if (state.filters.status && state.filters.status !== 'all') {
    const isRead = state.filters.status === 'read'
    filtered = filtered.filter((n) => n.isRead === isRead)
  }

  // Filter by priority
  if (state.filters.priority && state.filters.priority !== 'all') {
    filtered = filtered.filter((n) => n.priority === state.filters.priority)
  }

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return filtered
}

// Selector for unread count
export const getUnreadCount = (state: NotificationState): number => {
  return state.notifications.filter((n) => !n.isRead).length
}
