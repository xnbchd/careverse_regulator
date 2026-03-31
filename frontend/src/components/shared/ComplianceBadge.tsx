import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ComplianceStatus = "active" | "pending" | "expired" | "suspended" | "inactive"

// All color values reference CSS custom properties defined in index.css
// so light + dark mode are handled in one place without raw palette classes.
const variantMap: Record<ComplianceStatus, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending:
    "[background:var(--status-pending-bg)] [color:var(--status-pending-text)] [border-color:var(--status-pending-border)]",
  expired:
    "[background:var(--status-expired-bg)] [color:var(--status-expired-text)] [border-color:var(--status-expired-border)]",
  suspended:
    "[background:var(--status-suspended-bg)] [color:var(--status-suspended-text)] [border-color:var(--status-suspended-border)]",
  inactive: "bg-muted text-muted-foreground border-border",
}

const defaultLabels: Record<ComplianceStatus, string> = {
  active: "Active",
  pending: "Pending Review",
  expired: "Expired",
  suspended: "Suspended",
  inactive: "Inactive",
}

const dotColorMap: Record<ComplianceStatus, string> = {
  active: "bg-primary",
  pending: "[background:var(--status-pending-dot)]",
  expired: "[background:var(--status-expired-dot)]",
  suspended: "[background:var(--status-suspended-dot)]",
  inactive: "bg-muted-foreground/50",
}

export interface ComplianceBadgeProps {
  status: ComplianceStatus | string
  label?: string
  size?: "sm" | "md"
  className?: string
}

export function ComplianceBadge({ status, label, size = "sm", className }: ComplianceBadgeProps) {
  const safeStatus: ComplianceStatus =
    status in variantMap ? (status as ComplianceStatus) : "inactive"

  const displayLabel = label ?? defaultLabels[safeStatus]

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        variantMap[safeStatus],
        className
      )}
    >
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          size === "sm" ? "w-[5px] h-[5px]" : "w-1.5 h-1.5",
          dotColorMap[safeStatus]
        )}
        aria-hidden="true"
      />
      {displayLabel}
    </Badge>
  )
}
