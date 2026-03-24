import { useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCheck, Trash2, Mail, MailOpen } from 'lucide-react'
import { useNotificationStore, getFilteredNotifications, getUnreadCount } from '@/stores/notificationStore'
import NotificationFilters from './NotificationFilters'
import NotificationCard from './NotificationCard'

export default function NotificationsView() {
  const navigate = useNavigate()
  const {
    initialize,
    filters,
    selectedIds,
    markAsRead,
    markAsUnread,
    deleteNotifications,
    markAllAsRead,
    updateFilters,
    setSelectedIds,
    clearFilters,
  } = useNotificationStore()

  const notifications = useNotificationStore(getFilteredNotifications)
  const unreadCount = useNotificationStore(getUnreadCount)

  useEffect(() => {
    initialize()
  }, [initialize])

  const allSelected = notifications.length > 0 && selectedIds.length === notifications.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < notifications.length

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(notifications.map((n) => n.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleMarkRead = (id: string) => {
    markAsRead([id])
  }

  const handleBulkMarkRead = () => {
    markAsRead(selectedIds)
  }

  const handleBulkMarkUnread = () => {
    markAsUnread(selectedIds)
  }

  const handleBulkDelete = () => {
    deleteNotifications(selectedIds)
  }

  const handleAction = (url: string) => {
    navigate({ to: url as any })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <NotificationFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        unreadCount={unreadCount}
      />

      {/* Bulk Actions */}
      {notifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    ref.indeterminate = someSelected
                  }
                }}
                onCheckedChange={handleToggleSelectAll}
                aria-label="Select all notifications"
              />

              <span className="text-sm text-muted-foreground">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
              </span>

              {selectedIds.length > 0 && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkMarkRead}
                    className="h-8"
                  >
                    <MailOpen className="w-4 h-4 mr-2" />
                    Mark Read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkMarkUnread}
                    className="h-8"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Mark Unread
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}

              {selectedIds.length === 0 && unreadCount > 0 && (
                <>
                  <div className="h-6 w-px bg-border ml-auto" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {filters.search || filters.type !== 'all' || filters.status !== 'all'
                    ? "No notifications match your filters. Try adjusting your search criteria."
                    : "You're all caught up! No new notifications at this time."}
                </p>
              </div>
              {(filters.search || filters.type !== 'all' || filters.status !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="mt-2">
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isSelected={selectedIds.includes(notification.id)}
              onToggleSelect={handleToggleSelect}
              onMarkRead={handleMarkRead}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
