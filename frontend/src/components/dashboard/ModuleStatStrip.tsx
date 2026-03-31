import { KpiCard, type KpiCardProps } from "./KpiCard"
import { cn } from "@/lib/utils"

export interface StatItem {
  label: string
  value: number | string
  color?: KpiCardProps["valueColor"]
  trend?: KpiCardProps["trend"]
}

export interface ModuleStatStripProps {
  stats: StatItem[]
  loading?: boolean
  className?: string
}

export function ModuleStatStrip({ stats, loading = false, className }: ModuleStatStripProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat) => (
        <KpiCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          valueColor={stat.color}
          trend={stat.trend}
          loading={loading}
        />
      ))}
    </div>
  )
}
