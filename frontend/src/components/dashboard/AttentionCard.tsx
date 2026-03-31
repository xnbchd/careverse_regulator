import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type AttentionVariant = "amber" | "red" | "teal"

export interface AttentionCardProps {
  count: number
  label: string
  sublabel?: string
  variant: AttentionVariant
  icon: LucideIcon
  href: string
  loading?: boolean
  className?: string
}

// Uses CSS custom properties from index.css — no raw palette classes
const variantStyles: Record<AttentionVariant, { border: string; count: string; icon: string }> = {
  amber: {
    border: "[border-left-color:var(--status-pending-dot)]",
    count: "[color:var(--status-pending-text)]",
    icon: "[color:var(--status-pending-dot)]",
  },
  red: {
    border: "[border-left-color:var(--status-expired-dot)]",
    count: "[color:var(--status-expired-text)]",
    icon: "[color:var(--status-expired-dot)]",
  },
  teal: {
    border: "border-l-primary",
    count: "text-primary",
    icon: "text-primary",
  },
}

export function AttentionCard({
  count,
  label,
  sublabel,
  variant,
  icon: Icon,
  href,
  loading = false,
  className,
}: AttentionCardProps) {
  const styles = variantStyles[variant]

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border/60 bg-card p-5 border-l-[3px]",
          styles.border,
          className
        )}
      >
        <Skeleton className="h-5 w-5 mb-3 rounded" />
        <Skeleton className="h-7 w-1/3 mb-2" />
        <Skeleton className="h-3.5 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    )
  }

  return (
    <Link
      to={href}
      aria-label={`${count} ${label} — view all`}
      className={cn(
        "block rounded-lg border border-border/60 bg-card p-5 border-l-[3px]",
        "transition-all duration-150 hover:shadow-md hover:border-border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        styles.border,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 mb-3", styles.icon)} aria-hidden="true" strokeWidth={1.75} />
      <p className={cn("text-xl font-semibold tracking-tight leading-none mb-1.5", styles.count)}>
        {count.toLocaleString()}
      </p>
      <p className="text-sm font-medium text-foreground leading-snug">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1 leading-snug">{sublabel}</p>}
    </Link>
  )
}
