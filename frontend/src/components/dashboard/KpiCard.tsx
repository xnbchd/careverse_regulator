import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type KpiValueColor = "default" | "primary" | "amber" | "red" | "orange"

export interface KpiTrend {
  direction: "up" | "down" | "flat"
  label: string
}

export interface KpiCardProps {
  label: string
  value: number | string
  valueColor?: KpiValueColor
  trend?: KpiTrend
  loading?: boolean
  className?: string
}

// Uses CSS custom properties from index.css — no raw palette classes
const valueColorMap: Record<KpiValueColor, string> = {
  default: "text-foreground",
  primary: "text-primary",
  amber: "[color:var(--status-pending-text)]",
  red: "[color:var(--status-expired-text)]",
  orange: "[color:var(--status-suspended-text)]",
}

const trendColorMap: Record<KpiTrend["direction"], string> = {
  up: "text-primary",
  down: "[color:var(--status-expired-text)]",
  flat: "text-muted-foreground",
}

const trendPrefixMap: Record<KpiTrend["direction"], string> = {
  up: "↑",
  down: "↓",
  flat: "—",
}

export function KpiCard({
  label,
  value,
  valueColor = "default",
  trend,
  loading = false,
  className,
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className={cn("border border-border/60", className)}>
        <CardContent className="p-4">
          <Skeleton className="h-3 w-2/3 mb-3" />
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border border-border/60", className)}>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {label}
        </p>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight leading-none",
            valueColorMap[valueColor]
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {trend && (
          <p
            className={cn(
              "text-xs font-semibold mt-1.5 flex items-center gap-1",
              trendColorMap[trend.direction]
            )}
          >
            <span aria-hidden="true">{trendPrefixMap[trend.direction]}</span>
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
