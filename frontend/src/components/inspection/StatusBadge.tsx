import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Inspection } from "@/types/inspection"

interface StatusBadgeProps {
  status: Inspection["status"]
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    "Non Compliant": {
      className:
        "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400",
      dotClassName: "bg-yellow-800 dark:bg-yellow-400",
      text: "Non Compliant",
    },
    Completed: {
      className:
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-400",
      dotClassName: "bg-green-800 dark:bg-green-400",
      text: "Completed",
    },
    Pending: {
      className:
        "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400",
      dotClassName: "bg-red-800 dark:bg-red-400",
      text: "Pending",
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
