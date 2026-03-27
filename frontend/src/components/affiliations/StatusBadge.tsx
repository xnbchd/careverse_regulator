import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Active" | "Inactive" | "Pending" | "Rejected"
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-muted text-foreground dark:bg-gray-900/30 dark:text-gray-400",
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium capitalize", variants[status], className)}
    >
      {status}
    </Badge>
  )
}
