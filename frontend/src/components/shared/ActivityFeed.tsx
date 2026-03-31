import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type ActivityColor = "primary" | "amber" | "red"

export interface ActivityItem {
  id: string
  text: ReactNode
  timestamp: string
  /** ISO 8601 datetime string for the <time> element. Falls back to timestamp if omitted. */
  datetime?: string
  color: ActivityColor
}

export interface ActivityFeedProps {
  items: ActivityItem[]
  loading?: boolean
  className?: string
}

// Uses CSS custom properties from index.css — no raw palette classes
const dotColorMap: Record<ActivityColor, string> = {
  primary: "bg-primary",
  amber: "[background:var(--status-pending-dot)]",
  red: "[background:var(--status-expired-dot)]",
}

export function ActivityFeed({ items, loading = false, className }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-0", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 py-3 border-b border-border last:border-0"
          >
            <Skeleton className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground py-4 text-center", className)}>
        No recent activity
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-2.5 py-3 border-b border-border last:border-0"
        >
          <span
            className={cn(
              "w-[7px] h-[7px] rounded-full mt-1.5 flex-shrink-0",
              dotColorMap[item.color]
            )}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground/90 leading-relaxed">{item.text}</p>
            <time
              dateTime={item.datetime ?? item.timestamp}
              className="text-[11px] text-muted-foreground mt-0.5 block"
            >
              {item.timestamp}
            </time>
          </div>
        </div>
      ))}
    </div>
  )
}
