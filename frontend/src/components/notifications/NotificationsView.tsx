import { useState, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCheck, Trash2, Mail, Bell } from "lucide-react"
import { useNotificationStore } from "@/stores/notificationStore"

export default function NotificationsView() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotificationStore()

  const [selectedIds, setSelectedIds] = useState<string[]>([])

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
    markAsRead(id)
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
  }

  const handleBulkMarkRead = () => {
    selectedIds.forEach((id) => markAsRead(id))
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteNotification(id))
    setSelectedIds([])
  }

  const handleAction = (url: string) => {
    navigate({ to: url as any })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
      </div>

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
                  : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
              </span>

              {selectedIds.length > 0 && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <Button variant="ghost" size="sm" onClick={handleBulkMarkRead} className="h-8">
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark Read
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
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8">
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
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up! No new notifications at this time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
              }`}
              onClick={() => {
                if (!notification.read) {
                  handleMarkRead(notification.id)
                }
                if (notification.actionUrl) {
                  handleAction(notification.actionUrl)
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Checkbox
                    checked={selectedIds.includes(notification.id)}
                    onCheckedChange={() => handleToggleSelect(notification.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      {notification.actionUrl && (
                        <span className="text-xs text-primary">
                          {notification.actionLabel || "View"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
