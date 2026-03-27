import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LicenseStatus } from "@/types/license"

interface StatusBadgeProps {
  status: LicenseStatus | string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Issued: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Expired: "bg-muted text-foreground dark:bg-gray-900/30 dark:text-gray-400",
    Suspended: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Denied: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    "In Review": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "Renewal Reviewed": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    "Info Requested": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium capitalize",
        variants[status] || "bg-muted text-foreground",
        className
      )}
    >
      {status}
    </Badge>
  )
}
