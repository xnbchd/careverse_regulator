import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Finding } from "@/stores/findingsStore"

interface FindingsBadgeProps {
  severity?: Finding["severity"]
  status?: Finding["status"]
}

export default function FindingsBadge({ severity, status }: FindingsBadgeProps) {
  if (severity) {
    const severityConfig = {
      Critical: {
        className:
          "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400",
        dotClassName: "bg-red-800 dark:bg-red-400",
        text: "Critical",
      },
      Major: {
        className:
          "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400",
        dotClassName: "bg-yellow-800 dark:bg-yellow-400",
        text: "Major",
      },
      Minor: {
        className:
          "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400",
        dotClassName: "bg-blue-800 dark:bg-blue-400",
        text: "Minor",
      },
    }

    const config = severityConfig[severity]

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

  if (status) {
    const statusConfig = {
      Open: {
        className:
          "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-400",
        dotClassName: "bg-red-800 dark:bg-red-400",
        text: "Open",
      },
      Resolved: {
        className:
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-400",
        dotClassName: "bg-green-800 dark:bg-green-400",
        text: "Resolved",
      },
      "In Progress": {
        className:
          "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400",
        dotClassName: "bg-blue-800 dark:bg-blue-400",
        text: "In Progress",
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

  return null
}
