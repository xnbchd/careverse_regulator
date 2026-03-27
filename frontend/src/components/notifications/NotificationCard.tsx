import { Bell, Clock, AlertTriangle, Calendar, MessageSquare, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types/notification"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

interface NotificationCardProps {
  notification: Notification
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onMarkRead: (id: string) => void
  onAction?: (url: string) => void
}

const typeIcons = {
  alert: AlertTriangle,
  reminder: Clock,
  followup: MessageSquare,
  system: Settings,
}

const typeColors = {
  alert: "text-red-500",
  reminder: "text-blue-500",
  followup: "text-orange-500",
  system: "text-muted-foreground",
}

const priorityColors = {
  high: "border-l-red-500",
  medium: "border-l-orange-500",
  low: "border-l-gray-300",
}

export default function NotificationCard({
  notification,
  isSelected,
  onToggleSelect,
  onMarkRead,
  onAction,
}: NotificationCardProps) {
  const Icon = typeIcons[notification.type]
  const timeAgo = dayjs(notification.timestamp).fromNow()

  return (
    <Card
      className={cn(
        "mb-3 border-l-4 transition-colors",
        priorityColors[notification.priority],
        !notification.isRead && "bg-blue-50/30 dark:bg-blue-950/10"
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(notification.id)}
            aria-label="Select notification"
          />

          <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", typeColors[notification.type])} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={cn(
                  "text-sm font-semibold",
                  !notification.isRead && "text-foreground",
                  notification.isRead && "text-muted-foreground"
                )}
              >
                {notification.title}
              </h3>
              {!notification.isRead && (
                <Badge variant="default" className="shrink-0 bg-blue-500">
                  New
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{timeAgo}</span>
                <Badge variant="outline" className="text-xs">
                  {notification.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notification.id)}
                    className="h-7 text-xs"
                  >
                    Mark Read
                  </Button>
                )}
                {notification.actionUrl && notification.actionLabel && (
                  <Button
                    size="sm"
                    onClick={() => onAction?.(notification.actionUrl!)}
                    className="h-7 text-xs"
                  >
                    {notification.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
