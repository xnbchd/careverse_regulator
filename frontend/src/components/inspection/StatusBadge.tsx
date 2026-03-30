import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Inspection } from "@/types/inspection"

interface StatusBadgeProps {
  status: Inspection["status"]
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    Inspection["status"],
    {
      className: string
      dotClassName: string
      text: string
    }
  > = {
    Assigned: {
      className:
        "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400",
      dotClassName: "bg-blue-800 dark:bg-blue-400",
      text: "Assigned",
    },
    "In Progress": {
      className:
        "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400",
      dotClassName: "bg-amber-800 dark:bg-amber-400",
      text: "In Progress",
    },
    Submitted: {
      className:
        "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-400",
      dotClassName: "bg-purple-800 dark:bg-purple-400",
      text: "Submitted",
    },
    Reviewed: {
      className:
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-400",
      dotClassName: "bg-green-800 dark:bg-green-400",
      text: "Reviewed",
    },
    Cancelled: {
      className:
        "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400",
      dotClassName: "bg-gray-800 dark:bg-gray-400",
      text: "Cancelled",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium",
        config.className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClassName)} />
      {config.text}
    </Badge>
  )
}
